// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Layout from "./components/Layout";
import Toolbar from "./components/Toolbar";
import QuickActions from "./components/QuickActions";
import PartForm from "./components/PartForm.compact";
import PartTable from "./components/PartTable";
import SettingsPanel from "./components/SettingsPanel";
import Dashboard from "./components/Dashboard";
import OrdersPage from "./components/OrdersPage";
import AttachmentList from "./components/AttachmentList";
import ToastPro from "./components/ui/ToastPro";

import type { Part, Settings, Theme, Palette } from "./types";
import {
  addPart,
  allParts,
  deletePart,
  exportAll,
  getSettings,
  importAll,
  saveSettings,
  updatePart,
} from "./lib/db";
import { todayJalaliYMD } from "./utils/jalali";

type Filters = {
  q: string;
  status: string;
  settled: string;
  severity: string;
  dateType: "received" | "completed" | "delivered";
  from: string;
  to: string;
};

type ToastItem = {
  id: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
  duration?: number;
};

type View = "list" | "orders" | "dashboard" | "settings";

const FILTER_KEY = "repair-filters";

const DEFAULT_FILTERS: Filters = {
  q: "",
  status: "",
  settled: "",
  severity: "",
  dateType: "received",
  from: "",
  to: "",
};

const VIEW_KEY = "ordi-view";

export default function App() {
  /* -------- data -------- */
  const [parts, setParts] = useState<Part[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  /* -------- UI state -------- */
  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return "list";
    const saved = window.sessionStorage.getItem(VIEW_KEY) as View | null;
    if (saved === "list" || saved === "orders" || saved === "dashboard" || saved === "settings") {
      return saved;
    }
    const st = window.history.state as { view?: View } | null;
    return st?.view ?? "list";
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);

  const [filters, setFilters] = useState<Filters>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(FILTER_KEY) : null;
    if (!raw) return DEFAULT_FILTERS;
    try {
      const parsed = JSON.parse(raw) as Partial<Filters>;
      return { ...DEFAULT_FILTERS, ...parsed };
    } catch {
      return DEFAULT_FILTERS;
    }
  });

  /* -------- theme/palette -------- */
  const [theme, setTheme] = useState<Theme>("system");
  const [palette, setPalette] = useState<Palette>("ink");

  /* -------- ToastPro -------- */
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function addToast(
    message: string,
    type: ToastItem["type"] = "info",
    duration = 2200
  ) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  /* -------- Undo delete -------- */
  const [lastDeleted, setLastDeleted] = useState<Part | null>(null);

  /* -------- Export/Import input ref -------- */
  const importInputRef = useRef<HTMLInputElement>(null);

  /* -------- theme apply -------- */
  const applyTheme = useCallback((mode: Theme, pal: Palette) => {
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDark = mode === "dark" || (mode === "system" && prefersDark);

    document.documentElement.classList.toggle("dark", isDark);
    document.body.classList.remove("theme-ink", "theme-prism", "theme-sunset");
    document.body.classList.add(`theme-${pal}`);

    setTheme(mode);
    setPalette(pal);
  }, []);

  /* -------- load data -------- */
  const loadData = useCallback(async () => {
    const [ps, s] = await Promise.all([allParts(), getSettings()]);
    setParts(ps);
    setSettings(s);
    applyTheme(s.theme, s.palette ?? "ink");
  }, [applyTheme]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  /* -------- SPA history + نگه داشتن view در sessionStorage -------- */
  const navigate = useCallback((v: View, replace = false) => {
    setView(v);
    setShowForm(false);
    setEditing(null);
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(VIEW_KEY, v);
    const url = window.location.pathname + window.location.search;
    const state = { view: v };
    if (replace) {
      window.history.replaceState(state, "", url);
    } else {
      window.history.pushState(state, "", url);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const st = window.history.state as { view?: View } | null;
    if (!st || !st.view) {
      const url = window.location.pathname + window.location.search;
      window.history.replaceState({ view }, "", url);
      window.sessionStorage.setItem(VIEW_KEY, view);
    }
  }, [view]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (ev: PopStateEvent) => {
      const st = (ev.state as { view?: View }) || null;
      const nextView: View = st?.view ?? "list";
      setView(nextView);
      setShowForm(false);
      setEditing(null);
      window.sessionStorage.setItem(VIEW_KEY, nextView);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  /* -------- filter logic -------- */
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

    const dateISO =
      f.dateType === "received"
        ? p.receivedDate
        : f.dateType === "completed"
        ? p.completedDate || ""
        : p.deliveredDate || "";

    if (
      f.from &&
      (!dateISO ||
        new Date(dateISO).getTime() < new Date(f.from).getTime())
    )
      return false;

    if (
      f.to &&
      (!dateISO || new Date(dateISO).getTime() > new Date(f.to).getTime())
    )
      return false;

    if (f.q) {
      const q = f.q.trim().toLowerCase();
      const hay = [
        p.partName,
        p.customerName,
        p.faultDesc ?? "",
        p.technicianName,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  }, []);

  const filtered = useMemo(
    () => parts.filter((p) => matches(p, filters)),
    [parts, filters, matches]
  );

  /* -------- technicians از Settings -------- */
  let technicians: string[] = [];
  if (settings) {
    const techKey =
      Object.keys(settings).find((k) =>
        k.toLowerCase().includes("tech")
      ) ?? "defaultTechName";
    const raw = (settings as any)[techKey] as string | undefined;
    technicians = raw
      ? raw
          .split(/[،,]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  }

  /* -------- CRUD handlers -------- */
  async function handleCreate(p: Part) {
    await addPart(p);
    await loadData();
    setShowForm(false);
    addToast("قطعه جدید ثبت شد.", "success");
  }

  async function handleUpdate(p: Part) {
    if (!editing?.id) return;
    await updatePart(editing.id, p);
    await loadData();
    setEditing(null);
    addToast("به‌روزرسانی شد.", "success");
  }

  async function handleDelete(id: number) {
    const deleted = parts.find((p) => p.id === id) ?? null;
    if (!deleted) return;
    setLastDeleted(deleted);
    await deletePart(id);
    await loadData();
    addToast("رکورد حذف شد. می‌توانید آن را بازگردانی کنید.", "warning");
  }

  async function handleRestoreLastDeleted() {
    if (!lastDeleted) return;
    const { id: _ignored, ...rest } = lastDeleted;
    await addPart(rest as Part);
    setLastDeleted(null);
    await loadData();
    addToast("رکورد بازگردانده شد.", "success");
  }

  async function handleToggleSettled(p: Part) {
    if (!p.id) return;
    await updatePart(p.id, { settled: !p.settled });
    await loadData();
    addToast(
      p.settled ? "به حالت تسویه‌نشده تغییر کرد." : "تسویه شد.",
      "info"
    );
  }

  async function handleBulkDelete(ids: number[]) {
    if (!ids.length) return;
    await Promise.all(ids.map((id) => deletePart(id)));
    await loadData();
    addToast("حذف گروهی انجام شد.", "success");
  }

  async function handleBulkSettle(ids: number[], settled: boolean) {
    if (!ids.length) return;
    await Promise.all(ids.map((id) => updatePart(id, { settled })));
    await loadData();
    addToast("تغییر وضعیت گروهی انجام شد.", "success");
  }

  /* ---------- Guard & Currency ---------- */
  if (!settings) {
    return (
      <div className="shell" style={{ padding: "24px" }}>
        در حال بارگذاری…
      </div>
    );
  }

  const currency = settings.currency ?? "TOMAN";

  const undoBar =
    lastDeleted && (
      <div className="card p-3 mb-3 flex items-center justify-between text-xs">
        <div>
          رکورد «{lastDeleted.partName || "بدون نام"}» حذف شد.
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-tone btn-xs"
            onClick={handleRestoreLastDeleted}
          >
            بازگردانی
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setLastDeleted(null)}
          >
            بستن
          </button>
        </div>
      </div>
    );

  return (
    <>
      {/* hidden file input برای ورودی JSON */}
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          await importAll(JSON.parse(text));
          await loadData();
          addToast("ورودی JSON اعمال شد.", "success");
          e.target.value = "";
        }}
      />

      <Layout
        current={view}
        onNavigate={(v) => navigate(v)}
        theme={theme}
        onThemeToggle={async (t) => {
          const next = await saveSettings({ theme: t as Theme });
          setSettings(next);
          applyTheme(next.theme, next.palette ?? "ink");
        }}
        palette={palette}
        onPaletteChange={async (p) => {
          const next = await saveSettings({ palette: p as Palette });
          setSettings(next);
          applyTheme(next.theme, next.palette ?? "ink");
        }}
      >
        {view === "list" && (
          <section className="shell" data-page="list">
            <QuickActions
              parts={filtered}
              currency={currency}
              onAddClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              onResetFilters={() => setFilters(DEFAULT_FILTERS)}
              onOpenDashboard={() => navigate("dashboard")}
            />

            <div className="card p-3 mb-3">
              <div className="flex items-center gap-2 ms-auto">
                <button
                  className="btn btn-ghost text-xs"
                  onClick={() =>
                    exportAll().then((data) => {
                      const blob = new Blob([JSON.stringify(data, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `repair_backup_${todayJalaliYMD()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      addToast("خروجی JSON آماده شد.", "info");
                    })
                  }
                >
                  خروجی JSON
                </button>
                <button
                  className="btn btn-ghost text-xs"
                  onClick={() => importInputRef.current?.click()}
                >
                  ورودی JSON
                </button>
              </div>
            </div>

            {undoBar}

            <Toolbar
              onAddClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              filters={filters}
              onFiltersChange={(patch) =>
                setFilters({ ...filters, ...patch })
              }
              onFiltersReset={() => setFilters(DEFAULT_FILTERS)}
              onFiltersSave={() => {
                localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
                addToast("فیلتر ذخیره شد.", "info");
              }}
            />

            {showForm && !editing && (
              <div className="card p-4 mb-4">
                <h2 className="text-base font-semibold mb-3">
                  ثبت قطعه جدید
                </h2>
                <PartForm
                  defaults={settings}
                  technicians={technicians}
                  onSubmit={handleCreate}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {editing && (
              <div className="card p-4 mb-4">
                <h2 className="text-base font-semibold mb-3">
                  ویرایش قطعه — #{editing.id}
                </h2>
                <PartForm
                  initial={editing}
                  defaults={settings}
                  technicians={technicians}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditing(null)}
                />
                {editing.id && <AttachmentList partId={editing.id} />}
              </div>
            )}

            <PartTable
              parts={filtered}
              currency={currency}
              onEdit={(p) => {
                setEditing(p);
                setShowForm(false);
              }}
              onDelete={handleDelete}
              onToggleSettled={handleToggleSettled}
              onBulkDelete={handleBulkDelete}
              onBulkSettle={handleBulkSettle}
            />
          </section>
        )}

        {view === "orders" && (
          <section className="shell" data-page="orders">
            {undoBar}
            <OrdersPage
              parts={filtered}
              currency={currency}
              onEdit={(p) => {
                setEditing(p);
                setShowForm(true);
                navigate("list");
              }}
              onDelete={handleDelete}
              onToggleSettled={handleToggleSettled}
              onBack={() => navigate("dashboard")}
            />
          </section>
        )}

        {view === "dashboard" && (
          <section className="shell">
            <Dashboard
              parts={parts}
              currency={currency}
              onGo={(dest) => navigate(dest)}
              onQuickFilter={(patch) => {
                setFilters({ ...DEFAULT_FILTERS, ...patch });
                navigate("orders");
              }}
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
                addToast("تنظیمات ذخیره شد.", "success");
              }}
            />
          </section>
        )}
      </Layout>

      <ToastPro toasts={toasts} removeToast={removeToast} />
    </>
  );
}
