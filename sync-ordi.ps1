param(
  [string]$RepoRoot = 'D:\Projects\1. Website\1.Code\6. REPAIR',
  [string]$RemoteUrl = 'https://github.com/Bandi7777777/ORDI.git',
  [string]$Message   = (Get-Date -Format "yyyy-MM-dd HH:mm") + " - auto-sync",
  [switch]$UseSsh,
  [switch]$NoPull,
  [switch]$UntrackIgnored = $true
)

$ErrorActionPreference = 'Stop'

function WInfo([string]$m){ Write-Host "[i]  $m" -ForegroundColor Cyan }
function WOk([string]$m){ Write-Host "[OK] $m" -ForegroundColor Green }
function WErr([string]$m){ Write-Host "[X]  $m" -ForegroundColor Red }

# --- Resolve RemoteUrl if SSH requested ---
if ($UseSsh) {
  $RemoteUrl = 'git@github.com:Bandi7777777/ORDI.git'
}

# --- Ensure repo folder ---
if (-not (Test-Path -LiteralPath $RepoRoot)) {
  WInfo "Creating folder: $RepoRoot"
  New-Item -ItemType Directory -Path $RepoRoot -Force | Out-Null
}

Push-Location -LiteralPath $RepoRoot
try {
  git --version | Out-Null
} catch {
  WErr "Git is not installed or not in PATH."
  Pop-Location
  exit 1
}

# --- Init repo if missing ---
if (-not (Test-Path ".git")) {
  WInfo "git init"
  git init | Out-Null
}

# --- Ensure remote 'origin' ---
$curRemote = $null
try { $curRemote = (git remote get-url origin 2>$null).Trim() } catch {}
if (-not $curRemote) {
  WInfo "Adding remote 'origin' -> $RemoteUrl"
  git remote add origin $RemoteUrl | Out-Null
} elseif ($curRemote -ne $RemoteUrl) {
  WInfo "Updating remote 'origin' -> $RemoteUrl"
  git remote set-url origin $RemoteUrl | Out-Null
}

# --- Determine branch (keep current; fallback main) ---
$branch = $null
try { $branch = (git rev-parse --abbrev-ref HEAD 2>$null).Trim() } catch {}
if ([string]::IsNullOrWhiteSpace($branch) -or $branch -eq 'HEAD') { $branch = 'main' }

# --- Smart .gitignore: add (if missing) a curated ignore set for temp/huge/unnecessary files ---
$gi = ".gitignore"
$coreIgnore = @(
  "# --- ORDI: core ignores ---",
  ".DS_Store",
  "Thumbs.db",
  "desktop.ini",
  "*.tmp",
  "*.temp",
  "*.bak",
  "*.swp",
  "*.swo",
  "*.orig",
  "*.log",
  "",
  "# caches & builds",
  "node_modules/",
  ".cache/",
  "dist/",
  "build/",
  "out/",
  "tmp/",
  "temp/",
  "coverage/",
  "reports/",
  ".next/",
  ".nuxt/",
  ".vite/",
  ".parcel-cache/",
  ".angular/cache/",
  "",
  "# Python",
  "__pycache__/",
  ".venv/",
  ".env",
  ".env.*",
  ".mypy_cache/",
  ".pytest_cache/",
  ".ipynb_checkpoints/",
  "",
  "# .NET / C#",
  "bin/",
  "obj/",
  "packages/",
  "TestResults/",
  ".vs/",
  "*.user",
  "*.suo",
  "",
  "# PHP / Composer",
  "vendor/",
  "",
  "# Java / JVM",
  ".gradle/",
  "target/",
  "*.iml",
  "",
  "# IDEs",
  ".idea/",
  ".history/",
  "",
  "# VS Code (keep common JSON configs)",
  ".vscode/*",
  "!.vscode/settings.json",
  "!.vscode/tasks.json",
  "!.vscode/launch.json",
  "!.vscode/extensions.json",
  "",
  "# Big binary sources (usually keep out of Git)",
  "*.zip",
  "*.7z",
  "*.rar",
  "*.tar",
  "*.gz",
  "*.iso",
  "*.psd",
  "*.ai",
  "*.xd",
  "*.sketch",
  "*.blend",
  "*.fbx"
)

if (-not (Test-Path $gi)) { New-Item -Path $gi -ItemType File -Force | Out-Null }
$existing = @()
try { $existing = Get-Content -Path $gi -ErrorAction Stop } catch {}
$added = 0
foreach($line in $coreIgnore){
  if ($line -eq "") {
    if ($existing.Count -eq 0 -or $existing[-1] -ne "") {
      Add-Content -Path $gi -Value ""
      $existing += ""
    }
    continue
  }
  if (-not ($existing -contains $line)) {
    Add-Content -Path $gi -Value $line
    $existing += $line
    $added++
  }
}
if ($added -gt 0) { WInfo "Added $added line(s) to .gitignore" } else { WInfo ".gitignore already contains the core ignores" }

# --- Optionally untrack ignored/heavy folders that are already tracked (index only, keep files) ---
if ($UntrackIgnored) {
  $dirsToUntrack = @(
    "node_modules","dist","build","out","tmp","temp",".cache","coverage",".next",".nuxt",
    ".gradle","target","bin","obj","packages","TestResults",".vs",".idea","vendor",
    "__pycache__",".venv"
  )
  foreach($d in $dirsToUntrack){
    if (Test-Path -LiteralPath $d) {
      $tracked = git ls-files -- "$d" 2>$null
      if ($LASTEXITCODE -eq 0 -and $tracked) {
        WInfo "Untracking '$d' from index (keeps files on disk)"
        git rm -r --cached -- "$d" | Out-Null
      }
    }
  }
}

# --- Stage & Commit if needed ---
git add -A
$changes = git status --porcelain
$didCommit = $false
if ($changes) {
  git commit -m $Message | Out-Null
  $didCommit = $true
  WOk "Committed changes"
} else {
  WInfo "No local changes to commit"
}

# --- Pull (rebase) unless disabled ---
if (-not $NoPull) {
  try {
    WInfo "Pull (rebase) from origin/$branch"
    git pull --rebase origin $branch
  } catch {
    WErr "Pull failed (likely conflicts). Resolve and run again."
    Pop-Location
    exit 1
  }
}

# --- Push ---
# determine if upstream exists
$upstream = $null
try { $upstream = (git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null).Trim() } catch {}

if ([string]::IsNullOrWhiteSpace($upstream)) {
  WInfo "First push with upstream: origin/$branch"
  git push -u origin $branch
} else {
  WInfo "Push to $upstream"
  git push
}

WOk "Sync complete on branch '$branch'"
Pop-Location
