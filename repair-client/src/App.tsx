import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Layout from "./components/Layout";
import Toolbar from "./components/Toolbar";
import QuickActions from "./components/QuickActions";
import PartForm from "./components/PartForm"; // اگر کامپکت را جایگزین کردی، این را به "./components/PartForm.compact" تغییر بده
import PartTable from "./components/PartTable";
import SettingsPanel from "./components/SettingsPanel";
import Dashboard from "./components/Dashboard";
import AttachmentList from "./components/AttachmentList";
import Toast from "./components/Toast";

import type { Part, Settings, Theme, Palette } from "./types";
import {
  addPart, allParts, deletePart, exportAll, getSettings, importAll, saveSettings, updatePart
} from "./lib/db";
import { todayJalaliYMD } from "./utils/jalali";

type Filters = {
  q: string;
  status: string;    // "" | "pending" | "repaired"
  settled: string;   // "" | "yes" | "no"
  severity: string;  // CSV: "" | "normal,urgent"
  dateType: "received" | "completed" | "delivered";
  from: string;      // ISO
  to: string;        // ISO
};

const FILTER_KEY = "repair-filters";

export default function App() {
  const [parts, setParts] = useState<Part[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);

  const [filters, setFilters] = useState<Filters>(() => {
    const raw = localStorage.getItem(FILTER_KEY);
    return raw
      ? JSON.parse(raw) as Filters
      : { q:"", status:"", settled:"", severity:"", dateType:"received", from:"", to:"" };
  });

  const [view, setView] = useState<"list"|"dashboard"|"settings">("list");
  const [settings, setSettings] = useState<Settings | null>(null);
  const [theme, setTheme] = useState<Theme>("system");
  const [palette, setPalette] = useState<Palette>("ink");
  const [toast, setToast] = useState("");

  const importInputRef = useRef<HTMLInputElement>(null);

  /* -------- Theme & Palette -------- */
  const applyTheme = useCallback((mode: Theme, pal: Palette) => {
    setTheme(mode);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = mode === "dark" || (mode === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", isDark);

    setPalette(pal);
    document.body.classList.remove("theme-ink","theme-prism","theme-sunset");
    document.body.classList.add(`theme-${pal}`);
  }, []);

  /* -------- Data -------- */
  const loadData = useCallback(async () => {
    const [ps, s] = await Promise.all([allParts(), getSettings()]);
    setParts(ps);
    setSettings(s);
    applyTheme(s.theme, s.palette ?? "ink");
  }, [applyTheme]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { localStorage.setItem(FILTER_KEY, JSON.stringify(filters)); }, [filters]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t); }, [toast]);

  /* -------- Filtering -------- */
  const matches = useCallback((p: Part, f: Filters) => {
    if (f.status && p.status !== f.status) return false;
    if (f.settled) {
      const want = f.settled === "yes";
      if (p.settled !== want) return false;
    }
    if (f.severity) {
      const list = f.severity.split(",").filter(Boolean);
      if (list.length && !list.includes(p.severity)) return false;
    }
    const dateISO = f.dateType === "received" ? p.receivedDate
                   : f.dateType === "completed" ? (p.completedDate || "")
                   : (p.deliveredDate || "");
    if (f.from && (!dateISO || new Date(dateISO).getTime() < new Date(f.from).getTime())) return false;
    if (f.to &&   (!dateISO || new Date(dateISO).getTime() > new Date(f.to).getTime())) return false;

    if (f.q) {
      const q = f.q.trim().toLowerCase();
      const hay = [p.partName, p.customerName, p.faultDesc ?? "", p.technicianName].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }, []);

  const filtered = useMemo(() => parts.filter((p) => matches(p, filters)), [parts, filters, matches]);

  /* -------- CRUD -------- */
  async function handleCreate(p: Part) { await addPart(p); await loadData(); setShowForm(false); setToast("قطعه جدید ثبت شد."); }
  async function handleUpdate(p: Part) { if (!editing?.id) return; await updatePart(editing.id, p); await loadData(); setEditing(null); setToast("به‌روزرسانی شد."); }
  async function handleDelete(id: number) { await deletePart(id); await loadData(); setToast("حذف شد."); }
  async function handleToggleSettled(p: Part) { if (!p.id) return; await updatePart(p.id, { settled: !p.settled }); await loadData(); }
  async function handleBulkDelete(ids: number[]) { if (!ids.length) return; await Promise.all(ids.map(id=>deletePart(id))); await loadData(); setToast("حذف گروهی انجام شد."); }
  async function handleBulkSettle(ids: number[], settled: boolean) { if (!ids.length) return; await Promise.all(ids.map(id=>updatePart(id,{ settled }))); await loadData(); setToast("تغییر وضعیت گروهی انجام شد."); }

  /* -------- Export / Import -------- */
  async function exportJSON() {
    const data = await exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `repair_backup_${todayJalaliYMD()}.json`; a.click();
    URL.revokeObjectURL(url);
    setToast("خروجی JSON آماده شد.");
  }
  async function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text(); await importAll(JSON.parse(text)); await loadData();
    setToast("ورودی JSON اعمال شد."); e.target.value = "";
  }

  /* ---------- Guard ---------- */
  if (!settings) {
    // پیش از لود شدن Settings چیزی با settings.currency رندر نشود
    return <div className="p-6 opacity-75">در حال بارگذاری…</div>;
  }
  const currency = settings.currency ?? "TOMAN"; // گارد دوم

  return (
    <>
      <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportChange} />

      <Layout
        current={view}
        onNavigate={(v) => { setView(v); setShowForm(false); setEditing(null); }}
        theme={theme}
        onThemeToggle={async (t) => { const next = await saveSettings({ theme: t as Theme }); setSettings(next); applyTheme(next.theme, next.palette ?? "ink"); }}
        palette={palette}
        onPaletteChange={async (p) => { const next = await saveSettings({ palette: p as Palette }); setSettings(next); applyTheme(next.theme, next.palette ?? "ink"); }}
      >
        {view === "list" && (
          <section className="shell" data-page="list">
            <QuickActions
              parts={filtered}
              currency={currency}
              onAddClick={() => { setEditing(null); setShowForm(true); }}
              onResetFilters={() => setFilters({ q:"", status:"", settled:"", severity:"", dateType:"received", from:"", to:"" })}
              onOpenDashboard={() => setView("dashboard")}
            />

            <div className="card p-3 mb-3">
              <div className="flex items-center gap-2 ms-auto">
                <button className="btn btn-ghost text-xs" onClick={exportJSON}>خروجی JSON</button>
                <button className="btn btn-ghost text-xs" onClick={() => importInputRef.current?.click()}>ورودی JSON</button>
              </div>
            </div>

            <Toolbar
              onAddClick={() => { setEditing(null); setShowForm(true); }}
              filters={{ q:filters.q, status:filters.status, settled:filters.settled, severity:filters.severity, dateType:filters.dateType, from:filters.from, to:filters.to }}
              onFiltersChange={(patch) => setFilters({ ...filters, ...patch })}
              onFiltersReset={() => setFilters({ q:"", status:"", settled:"", severity:"", dateType:"received", from:"", to:"" })}
              onFiltersSave={() => { localStorage.setItem(FILTER_KEY, JSON.stringify(filters)); setToast("فیلتر ذخیره شد."); }}
            />

            {showForm && !editing && (
              <div className="card p-4 mb-4">
                <h2 className="text-base font-semibold mb-3">ثبت قطعه جدید</h2>
                <PartForm defaults={settings} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
              </div>
            )}

            {editing && (
              <div className="card p-4 mb-4">
                <h2 className="text-base font-semibold mb-3">ویرایش قطعه — #{editing.id}</h2>
                <PartForm initial={editing} defaults={settings} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
                {editing.id && <AttachmentList partId={editing.id} />}
              </div>
            )}

            <PartTable
              parts={filtered}
              currency={currency}
              onEdit={(p) => { setEditing(p); setShowForm(false); }}
              onDelete={handleDelete}
              onToggleSettled={handleToggleSettled}
              onBulkDelete={handleBulkDelete}
              onBulkSettle={handleBulkSettle}
            />
          </section>
        )}

        {view === "dashboard" && (
          <section className="shell">
            {/* CTAها واقعاً کار می‌کنند */}
            <Dashboard
              parts={parts}
              currency={currency}
              onGo={(dest)=> setView(dest)}
              onQuickFilter={(patch)=> { setFilters((f)=>({ ...f, ...patch } as any)); setView("list"); }}
            />
          </section>
        )}

        {view === "settings" && (
          <section className="shell">
            <SettingsPanel
              initial={settings}
              onSave={async (patch) => {
                const next = await saveSettings(patch);
                setSettings(next);
                applyTheme(next.theme, next.palette ?? "ink");
                setToast("تنظیمات ذخیره شد.");
              }}
            />
          </section>
        )}
      </Layout>

      <Toast text={toast} onClose={() => setToast("")} />
    </>
  );
}
