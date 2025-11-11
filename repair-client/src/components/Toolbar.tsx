import { useEffect, useMemo, useState } from "react";
import SelectPro, { SelectOption } from "./ui/SelectPro";
import JalaliDatePicker from "./JalaliDatePicker";

type Filters = {
  q: string;
  status: string;
  settled: string;
  severity: string;               // CSV
  dateType: "received" | "completed" | "delivered";
  from: string;                   // ISO
  to: string;                     // ISO
};

type Props = {
  onAddClick: () => void;
  filters: Filters;
  onFiltersChange: (p: Partial<Filters>) => void;
  onFiltersReset: () => void;
  onFiltersSave: () => void;
};

/* آیکن‌های سبک */
const IcStatus = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
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

/* گزینه‌ها */
const statusOptions: SelectOption[] = [
  { label: "همه وضعیت‌ها", value: "", icon: IcStatus },
  { label: "در جریان",     value: "pending",  icon: IcClock },
  { label: "تعمیر شده",    value: "repaired", icon: IcCheck },
];
const settledOptions: SelectOption[] = [
  { label: "تسویه (همه)",  value: "",   icon: IcStatus },
  { label: "تسویه شد",     value: "yes", icon: IcCheck },
  { label: "تسویه نشده",   value: "no",  icon: IcClock },
];
const severityOptions: SelectOption[] = [
  { label: "عادی",     value: "normal",   icon: IcStatus },
  { label: "فوری",     value: "urgent",   icon: IcBolt },
  { label: "بحرانی",   value: "critical", icon: IcClock },
];
const dateTypeOptions: SelectOption[] = [
  { label: "تحویل‌گیری",      value: "received",  icon: IcClock },
  { label: "تکمیل تعمیر",     value: "completed", icon: IcCheck },
  { label: "تحویل به مشتری",   value: "delivered", icon: IcCheck },
];

export default function Toolbar({
  onAddClick, filters, onFiltersChange, onFiltersReset, onFiltersSave
}: Props) {
  /* چندگزینه‌ایِ اولویت‌ها */
  const [sev, setSev] = useState<string[]>(
    filters.severity ? filters.severity.split(",").filter(Boolean) : []
  );
  useEffect(() => { onFiltersChange({ severity: sev.join(",") }); }, [sev]);

  const sevLabel = useMemo(() => {
    if (!sev.length) return "اولویت (همه)";
    const map = new Map(severityOptions.map(o => [o.value, o.label]));
    const labels = sev.map(v => map.get(v) ?? v);
    const shown = labels.slice(0, 2).join("، ");
    const rest  = labels.length - 2;
    return rest > 0 ? `${shown} +${rest}` : shown;
  }, [sev]);

  return (
    <div className="toolbar-pro card p-3 mb-4">
      {/* ردیف 1: دکمه + فیلترهای اصلی */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" onClick={onAddClick}>+ ثبت قطعه جدید</button>

        {/* وضعیت‌ها */}
        <div className="w-40">
          <SelectPro value={filters.status} onChange={(v)=>onFiltersChange({status:v})}
                     options={statusOptions} ariaLabel="وضعیت" placeholder="وضعیت"/>
        </div>

        {/* تسویه */}
        <div className="w-40">
          <SelectPro value={filters.settled} onChange={(v)=>onFiltersChange({settled:v})}
                     options={settledOptions} ariaLabel="تسویه" placeholder="تسویه"/>
        </div>

        {/* اولویت (چندگزینه‌ای) */}
        <div className="w-48">
          <SelectPro multiple value={sev} onChange={setSev}
                     options={severityOptions} placeholder={sevLabel} ariaLabel="اولویت"/>
        </div>

        {/* جستجو مینیمال (جمع‌وجور) */}
        <input
          className="input min-w-[220px] flex-1"
          placeholder="جستجو: قطعه / مشتری / عیب…"
          value={filters.q}
          onChange={(e)=>onFiltersChange({q:e.target.value})}
        />

        <div className="ms-auto flex items-center gap-2">
          <button className="btn btn-tone text-xs" onClick={onFiltersSave}>ذخیره فیلتر</button>
          <button className="btn btn-ghost text-xs" onClick={onFiltersReset}>ریست</button>
        </div>
      </div>

      {/* ردیف 2: تاریخ مینیمال و فشرده (در یک خط) */}
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="w-48">
          <SelectPro
            value={filters.dateType}
            onChange={(v)=>onFiltersChange({dateType: v as any})}
            options={dateTypeOptions}
            ariaLabel="نوع تاریخ"
            placeholder="نوع تاریخ"
          />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2 min-w-[320px]">
          <JalaliDatePicker label="از" value={filters.from} onChange={(iso)=>onFiltersChange({from: iso})}/>
          <JalaliDatePicker label="تا" value={filters.to}   onChange={(iso)=>onFiltersChange({to: iso})}/>
        </div>
      </div>
    </div>
  );
}