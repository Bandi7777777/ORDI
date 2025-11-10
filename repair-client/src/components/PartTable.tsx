import { useMemo, useState } from "react";
import type { Part, Currency } from "../types";
import { StatusBadge, SeverityBadge } from "./StatusBadge";
import { formatMoney, formatJalaliDate } from "../utils/format";
import { renderInvoicePDF } from "../utils/invoice";

/* آیکن‌های کوچک چیپ‌ها */
const IcIn  = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12h12m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const IcDone= () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
const IcOut = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 12H8m0 0 4 4m-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);

function DatesCell({ p }:{ p: Part }){
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="chip chip--cyan" title={`تاریخ دریافت: ${formatJalaliDate(p.receivedDate)}`}><IcIn/>{formatJalaliDate(p.receivedDate)}</span>
      <span className="chip chip--violet" title={p.completedDate? `تاریخ تکمیل: ${formatJalaliDate(p.completedDate)}`:"—"}>
        <IcDone/>{p.completedDate? formatJalaliDate(p.completedDate): "—"}
      </span>
      <span className="chip chip--mint" title={p.deliveredDate? `تاریخ تحویل: ${formatJalaliDate(p.deliveredDate)}`:"—"}>
        <IcOut/>{p.deliveredDate? formatJalaliDate(p.deliveredDate): "—"}
      </span>
    </div>
  );
}

type Props = {
  parts: Part[];
  currency?: Currency;
  onEdit: (p: Part) => void;
  onDelete: (id: number) => void;
  onToggleSettled: (p: Part) => void;
  onBulkDelete: (ids: number[]) => void;
  onBulkSettle: (ids: number[], settled: boolean) => void;
};

export default function PartTable({
  parts, currency="TOMAN",
  onEdit, onDelete, onToggleSettled, onBulkDelete, onBulkSettle
}: Props){
  const [selected,setSelected]=useState<number[]>([]);
  const allIds=useMemo(()=>parts.map(p=>p.id!).filter(Boolean),[parts]);
  const allSelected = selected.length && selected.length===allIds.length;
  const toggle=(id:number)=> setSelected(s=> s.includes(id)? s.filter(x=>x!==id): [...s,id]);
  const toggleAll=()=> setSelected(allSelected? []: allIds);
  const stripe=(sev:string)=> sev==="critical"?"#ff79c6": sev==="urgent"?"#a18bff": "#48e4ff";

  return (
    <div className="card p-3 overflow-x-auto">
      <div className="flex items-center gap-2 mb-2">
        <input type="checkbox" checked={!!allSelected} onChange={toggleAll}/>
        <span className="text-xs" style={{color:"var(--fg-2)"}}>انتخاب‌ها: {selected.length}</span>
        <div className="ms-auto flex items-center gap-2">
          <button className="btn btn-tone text-xs" disabled={!selected.length} onClick={()=>onBulkSettle(selected,true)}>تسویه: انجام شد</button>
          <button className="btn btn-tone text-xs" disabled={!selected.length} onClick={()=>onBulkSettle(selected,false)}>تسویه: نشده</button>
          <button className="btn btn-ghost text-xs text-rose-300" disabled={!selected.length} onClick={()=>onBulkDelete(selected)}>حذف گروهی</button>
        </div>
      </div>

      <table className="table">
        <colgroup>
          <col style={{width:"36px"}}/>
          <col style={{width:"48px"}}/>
          <col style={{width:"280px"}}/> {/* زمان‌ها */}
          <col style={{width:"180px"}}/>  {/* قطعه */}
          <col style={{width:"180px"}}/>  {/* مشتری */}
          <col style={{width:"160px"}}/>  {/* تعمیرکننده */}
          <col/>                          {/* توضیح - دو خط */}
          <col style={{width:"120px"}}/>
          <col style={{width:"120px"}}/>
          <col style={{width:"120px"}}/>
          <col style={{width:"120px"}}/>
          <col style={{width:"120px"}}/>
          <col style={{width:"160px"}}/>  {/* PDF/عملیات */}
        </colgroup>
        <thead>
          <tr>
            <th><input type="checkbox" checked={!!allIds.length && allSelected} onChange={toggleAll}/></th>
            <th>#</th>
            <th>زمان‌ها</th>
            <th>قطعه</th>
            <th>مشتری</th>
            <th>تعمیرکننده</th>
            <th>توضیح</th>
            <th>قیمت تعمیر</th>
            <th>قیمت من</th>
            <th>قیمت نهایی</th>
            <th>وضعیت</th>
            <th>تسویه</th>
            <th>اولویت</th>
            <th>PDF / عملیات</th>
          </tr>
        </thead>
        <tbody>
          {parts.map(p=>(
            <tr key={p.id} style={{borderInlineStart:`4px solid ${stripe(p.severity)}`}}>
              <td>{p.id && <input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggle(p.id!)}/>}</td>
              <td>{p.id}</td>

              <td><DatesCell p={p}/></td>

              <td className="cell-ellipsis" title={p.partName}>{p.partName}</td>
              <td className="cell-ellipsis" title={p.customerName}>{p.customerName}</td>
              <td className="cell-ellipsis" title={p.technicianName}>{p.technicianName}</td>

              {/* توضیح دو خطه - اگر خالی بود خط تیره */}
              <td className="cell-2line" title={p.faultDesc || p.notes || "—"}>
                {p.faultDesc || p.notes || "—"}
              </td>

              <td>{formatMoney(p.techPrice,currency)}</td>
              <td>{formatMoney(p.myPrice,currency)}</td>
              <td>{formatMoney(p.companyPrice,currency)}</td>

              <td><StatusBadge status={p.status}/></td>
              <td>
                <div className="flex items-center gap-2">
                  <span className={`badge ${p.settled?"badge-normal":"badge-critical"}`}>{p.settled? "تسویه شد":"تسویه نشده"}</span>
                  <button className="btn btn-ghost text-xs" onClick={()=>onToggleSettled(p)}>تغییر</button>
                </div>
              </td>
              <td><SeverityBadge severity={p.severity}/></td>

              <td className="whitespace-nowrap">
                <button className="btn btn-tone text-xs me-1" onClick={()=>renderInvoicePDF(p,currency)}>PDF</button>
                <button className="btn btn-ghost text-xs me-1" onClick={()=>onEdit(p)}>ویرایش</button>
                <button className="btn btn-ghost text-xs text-rose-300" onClick={()=>p.id && onDelete(p.id)}>حذف</button>
              </td>
            </tr>
          ))}
          {!parts.length && (
            <tr><td colSpan={14} className="text-center opacity-80 py-6">هنوز رکوردی ثبت نشده — از «ثبت قطعه جدید» شروع کنید.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
