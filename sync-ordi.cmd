@echo off
setlocal EnableExtensions

REM === ORDI one-click sync (wrapper) ===
REM Puts PowerShell script next to this CMD and runs it with ExecutionPolicy bypass.
REM Double-click this CMD. Any extra arguments will be forwarded to the PS1.

set "HERE=%~dp0"
set "PS1=%HERE%sync-ordi.ps1"

if not exist "%PS1%" (
  echo [X] PowerShell script not found: "%PS1%"
  echo     Put sync-ordi.ps1 next to this file, or edit this CMD to point to it.
  pause
  exit /b 1
)

set "PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

"%PS%" -NoProfile -ExecutionPolicy Bypass -File "%PS1%" %*
if errorlevel 1 (
  echo.
  echo [X] Sync finished WITH ERRORS. See messages above.
) else (
  echo.
  echo [OK] Sync finished successfully.
)

pause
endlocal
