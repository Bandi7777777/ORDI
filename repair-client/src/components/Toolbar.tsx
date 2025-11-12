import { useEffect, useMemo, useState } from "react";
import SelectPro, { SelectOption } from "./ui/SelectPro";
import JalaliDatePicker from "./JalaliDatePicker";

type Filters = {
  q: string;
  status: string;
  settled: string;
  severity: string;               // CSV for multiple severities
  dateType: "received" | "completed" | "delivered";
  from: string;                   // ISO date
  to: string;                     // ISO date
};

type Props = {
  onAddClick: () => void;
  filters: Filters;
  onFiltersChange: (patch: Partial<Filters>) => void;
  onFiltersReset: () => void;
  onFiltersSave: () => void;
  showSearch?: boolean;  // whether to display the search field
};

const IcStatus = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
const IcCheck = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IcClock = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IcBolt = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

// Options for status and settled selects (with icons)
const statusOptions: SelectOption[] = [
  { label: "همه وضعیت‌ها", value: "", icon: IcStatus },
  { label: "در جریان",     value: "pending",  icon: IcClock },
  { label: "تعمیر شده",    value: "repaired", icon: IcCheck },
];
const settledOptions: SelectOption[] = [
  { label: "تسویه (همه)", value: "",   icon: IcStatus },
  { label: "تسویه شد",    value: "yes", icon: IcCheck },
  { label: "تسویه نشده",  value: "no",  icon: IcClock },
];

// Severity values for segmented toggle (multi-select allowed)
const severityLabels: Record<string, string> = {
  normal: "عادی",
  urgent: "فوری",
  critical: "بحرانی",
};
const severityIcons: Record<string, JSX.Element> = {
  normal: IcStatus,
  urgent: IcBolt,
  critical: IcClock,
};

// Date type values for segmented toggle (single-select)
const dateTypeLabels: Record<Filters["dateType"], string> = {
  received: "دریافت",
  completed: "تکمیل",
  delivered: "تحویل",
};
const dateTypeIcons: Record<Filters["dateType"], JSX.Element> = {
  received: IcClock,
  completed: IcCheck,
  delivered: IcCheck,
};

export default function Toolbar({
  onAddClick,
  filters,
  onFiltersChange,
  onFiltersReset,
  onFiltersSave,
  showSearch = true
}: Props) {
  // Local state for multiple severity selection
  const [sev, setSev] = useState<string[]>(
    filters.severity ? filters.severity.split(",").filter(Boolean) : []
  );
  useEffect(() => {
    onFiltersChange({ severity: sev.join(",") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sev]);

  // Compute placeholder or label for severity (for accessibility or tooltip)
  const sevLabel = useMemo(() => {
    if (!sev.length) return "اولویت (همه)";
    const labels = sev.map(v => severityLabels[v] || v);
    if (labels.length <= 2) return labels.join("، ");
    return `${labels.slice(0, 2).join("، ")} +${labels.length - 2}`;
  }, [sev]);

  return (
    <div className="toolbar-pro card p-3 mb-4">
      {/* Row 1: Add button and primary filters */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" onClick={onAddClick}>
          + ثبت قطعه جدید
        </button>

        {/* Status filter */}
        <div className="w-40">
          <SelectPro
            value={filters.status}
            onChange={(v) => onFiltersChange({ status: v })}
            options={statusOptions}
            ariaLabel="وضعیت"
            placeholder="وضعیت"
          />
        </div>

        {/* Settled filter */}
        <div className="w-40">
          <SelectPro
            value={filters.settled}
            onChange={(v) => onFiltersChange({ settled: v })}
            options={settledOptions}
            ariaLabel="تسویه"
            placeholder="تسویه"
          />
        </div>

        {/* Priority filter (severity) as segmented toggle, multi-selectable) */}
        <div>
          <div className="seg">
            {(["normal", "urgent", "critical"] as const).map(val => {
              const active = sev.includes(val);
              return (
                <button
                  key={val}
                  type="button"
                  className={`seg-btn ${active ? "active" : ""}`}
                  onClick={() =>
                    setSev(prev =>
                      prev.includes(val)
                        ? prev.filter(item => item !== val)    // toggle off
                        : [...prev, val]                       // toggle on
                    )
                  }
                  title={severityLabels[val]}
                >
                  {severityIcons[val]} {/** icon */}
                  <span className="hidden sm:inline">{severityLabels[val]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search (visible only if showSearch prop is true) */}
        {showSearch && (
          <input
            className="input min-w-[200px] flex-1"
            placeholder="جستجو: قطعه / مشتری / عیب…"
            value={filters.q}
            onChange={(e) => onFiltersChange({ q: e.target.value })}
          />
        )}

        {/* Save and Reset filter actions */}
        <div className="ms-auto flex items-center gap-2">
          <button className="btn btn-tone text-xs" onClick={onFiltersSave}>
            ذخیره فیلتر
          </button>
          <button className="btn btn-ghost text-xs" onClick={onFiltersReset}>
            ریست
          </button>
        </div>
      </div>

      {/* Row 2: Date type toggle and date range pickers */}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        {/* Date type segmented toggle */}
        <div>
          <div className="seg">
            {(["received", "completed", "delivered"] as const).map(val => (
              <button
                key={val}
                type="button"
                className={`seg-btn ${filters.dateType === val ? "active" : ""}`}
                onClick={() => onFiltersChange({ dateType: val })}
                title={dateTypeLabels[val]}
              >
                {dateTypeIcons[val]}
                <span className="hidden sm:inline">{dateTypeLabels[val]}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Date range pickers */}
        <div className="flex-1 grid grid-cols-2 gap-2 min-w-[320px]">
          <JalaliDatePicker
            label="از"
            value={filters.from}
            onChange={(iso) => onFiltersChange({ from: iso })}
          />
          <JalaliDatePicker
            label="تا"
            value={filters.to}
            onChange={(iso) => onFiltersChange({ to: iso })}
          />
        </div>
      </div>
    </div>
  );
}
