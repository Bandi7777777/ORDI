// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\components\QuickActions.tsx
import { useMemo } from "react";
import type { Part, Currency } from "../types";
import { formatMoney } from "../utils/format";
export default function QuickActions({ parts, currency, onAddClick, onResetFilters, onOpenDashboard }: {parts:Part[]; currency:Currency; onAddClick:()=>void; onResetFilters:()=>void; onOpenDashboard:()=>void;}){
  const stat = useMemo(()=>{
    const sum=(xs:number[])=>xs.reduce((a,b)=>a+b,0); const days=(a:string,b:string)=>Math.round((new Date(b).getTime()-new Date(a).getTime())/(1000*3600*24));
    const completed = parts.filter(p=>p.completedDate); const delivered = parts.filter(p=>p.deliveredDate);
    const avgComplete = completed.length? Math.round(sum(completed.map(p=>days(p.receivedDate!,p.completedDate!)))/completed.length):0;
    const avgDelivery = delivered.length? Math.round(sum(delivered.map(p=>days(p.completedDate||p.receivedDate!,p.deliveredDate!)))/delivered.length):0;
    return { pending:parts.filter(p=>p.status==="pending").length, unsettled:sum(parts.filter(p=>!p.settled).map(p=>p.companyPrice)), avgComplete, avgDelivery };
  },[parts]);
  return (
    <div className="card p-3 mb-3">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-primary" onClick={onAddClick}>+ ثبت قطعه</button>
        <span className="badge">در جریان: <b>{stat.pending}</b></span>
        <span className="badge">تسویه‌نشده: <b>{formatMoney(stat.unsettled, currency)}</b></span>
        <span className="badge">میانگین تکمیل: <b>{stat.avgComplete || "—"}</b> روز</span>
        <span className="badge">میانگین تحویل: <b>{stat.avgDelivery || "—"}</b> روز</span>
        <div className="ms-auto flex items-center gap-2">
          <button className="btn btn-tone text-xs" onClick={onOpenDashboard}>داشبورد</button>
          <button className="btn btn-ghost text-xs" onClick={onResetFilters}>ریست فیلتر</button>
        </div>
      </div>
    </div>
  );
}
