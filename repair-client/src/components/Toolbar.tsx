// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\components\Toolbar.tsx
import { useEffect, useMemo, useState } from "react";
import SelectPro, { SelectOption } from "./ui/SelectPro";
import JalaliDatePicker from "./JalaliDatePicker";

type Filters = {
  q: string;
  status: string;    // "" | "pending" | "repaired"
  settled: string;   // "" | "yes" | "no"
  severity: string;  // CSV: "" | "normal,urgent"
  dateType: "received" | "completed" | "delivered";
  from: string;      // ISO
  to: string;        // ISO
};

type Props = {
  onAddClick: () => void;
  filters: Filters;
  onFiltersChange: (patch: Partial<Filters>) => void;
  onFiltersReset: () => void;
  onFiltersSave: () => void;
};

const IcStatus = <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/></svg>;
const IcCheck  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcClock  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;

const statusOptions: SelectOption[] = [
  { label:"همه وضعیت‌ها", value:"",        icon: IcStatus, group:"وضعیت" },
  { label:"در جریان",     value:"pending",  icon: IcClock,  group:"وضعیت" },
  { label:"تعمیر شده",    value:"repaired", icon: IcCheck,  group:"وضعیت" },
];
const settledOptions: SelectOption[] = [
  { label:"تسویه (همه)", value:"",   icon: IcCheck, group:"تسویه" },
  { label:"تسویه شد",    value:"yes", icon: IcCheck, group:"تسویه" },
  { label:"تسویه نشده",  value:"no",  icon: IcClock, group:"تسویه" },
];
const severityOptions: SelectOption[] = [
  { label:"همه اولویت‌ها", value:"",       icon: IcStatus, group:"اولویت" },
  { label:"عادی",          value:"normal", icon: IcStatus, group:"اولویت" },
  { label:"فوری",          value:"urgent", icon: IcClock,  group:"اولویت" },
  { label:"خطرناک",        value:"critical", icon: IcCheck, group:"اولویت" },
];
const dateTypeOptions: SelectOption[] = [
  { label:"تحویل‌گیری",       value:"received",  icon: IcClock, group:"نوع تاریخ" },
  { label:"تکمیل تعمیر",      value:"completed", icon: IcCheck, group:"نوع تاریخ" },
  { label:"تحویل به مشتری",    value:"delivered", icon: IcCheck, group:"نوع تاریخ" },
];

export default function Toolbar({
  onAddClick, filters, onFiltersChange, onFiltersReset, onFiltersSave
}: Props) {

  const [sevMulti, setSev] = useState<string[]>(
    filters.severity ? filters.severity.split(",").filter(Boolean) : []
  );

  useEffect(()=>{ onFiltersChange({ severity: sev.get?.join? (sev as any).join(",") : (sev as any).toString() }); }, [sev]);

  const sevLabel = useMemo(() => {
    if (!sev.length) return "همهٔ اولویت‌ها";
    const map = new Map(severityOptions.map(o=>[o.value, o.label]));
    const labels = (sev as string[]).map(v=>map.get(v) ?? v);
    const shown = labels.slice(0,2).join("، ");
    const rest  = labels.length - 2;
    return rest>0 ? `${shown} +${rest}` : shown;
  }, [sev]);

  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary" onClick={onAddClick}>+ ثبت قطعه جدید</button>

        {/* وضعیت‌ها */}
        <div className="w-44">
          <SelectPro value={filters.status} onChange={(v)=>onFiltersChange({status:v})} options={statusOptions} ariaLabel="وضعیت" />
        </div>

        {/* تسویه */}
        <div className="w-40">
          <SelectPro value={filters.settled} onChange={(v)=>onFiltersChange({setted:v as any, settled: v})} options={settledOptions} ariaLabel="تسویه" />
        </div>

        {/* اولویت چندگزینه‌ای */}
        <div className="w-48">
          <SelectPro multiple value={sev as any} onChange={setSev as any} options={severityOptions} ariaLabel="اولویت" placeholder={sevLabel} />
        </div>

        {/* نوع تاریخ + دو پیکر جلالی جمع‌وجور */}
        <div className="flex flex-col gap-2 flex-1 min-w-[360px]">
          <div className="flex gap-2">
            <div className="w-48">
              <SelectPro value={filters.dateType} onChange={(v)=>onFormsChange({dateType: v as any})} options={dateTypeOptions} ariaLabel="نوع تاریخ" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <JalaliDatePicker label="از" value={filters.from} onChange={(iso)=>onFormsChange({from: iso})} />
              <JalaliDatePicker label="تا" value={filters.to} onChange={(iso)=>onFormsChange({to: iso})} />
            </div>
          </div>
        </div>

        {/* دکمه‌های پایانی جمع‌وجور */}
        <div className="ms-auto flex items-center gap-2">
          <button className="btn btn-tone text-xs" onClick={onFormsSave}>ذخیره فیلتر</button>
          <button className="btn btn-ghost text-xs" onClick={onFormsReset}>ریست</button>
        </div>
      </div>
    </div>
  );

  function onFormsChange(patch: Partial<Filters>){
    onFiltersChange(patch as any);
  }
  function onFormsSave(){ onFiltersSave(); }
  function onFormsReset(){ onFiltersReset(); }
}
