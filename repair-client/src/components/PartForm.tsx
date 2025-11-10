import { useEffect, useMemo, useState } from "react";
import type { Part, Severity, Status, Settings } from "../types";
import { calcPrices } from "../utils/calc";
import { PriceBadge } from "./PriceBadge";
import { formatInputLive, parseMoneyInput } from "../utils/format";
import { distinctTechnicians, distinctCustomers, distinctPartNames } from "../lib/db";
import { isoToJalaliStr, jalaliStrToIso, jMonthLength, todayISO } from "../utils/jalali";
import SelectPro, { SelectOption } from "./ui/SelectPro";

/* --- مینی‌پیکر جلالی (سه سلکت کم‌عرض در یک ردیف) --- */
function MiniJalali({ label, value, onChange }: { label?:string; value?: string; onChange:(iso:string)=>void }) {
  const iso = value || todayISO();
  const j = isoToJalaliStr(iso);
  const jy = +j.slice(0,4), jm = +j.slice(5,7), jd = +j.slice(8,10);

  const years = (() => {
    const now = +isoToJalaliStr(todayISO()).slice(0,4);
    const arr:number[]=[]; for(let y=now-6;y<=now+2;y++) arr.push(y); return arr.reverse();
  })();

  return (
    <div className="flex items-end gap-2">
      {label && <div className="text-xs opacity-75">{label}</div>}
      <select className="select w-24" value={jy}
        onChange={(e)=>{const y=+e.target.value; const d=Math.min(jd, jMonthLength(y, jm)); onChange(jalaliStrToIso(`${y}/${String(jm).padStart(2,"0")}/${String(d).padStart(2,"0")}`));}}>
        {years.map(y=><option key={y} value={y}>{y}</option>)}
      </select>
      <select className="select w-20" value={jm}
        onChange={(e)=>{const m=+e.target.value; const d=Math.min(jd, jMonthLength(jy, m)); onChange(jalaliStrToIso(`${jy}/${String(m).padStart(2,"0")}/${String(d).padStart(2,"0")}`));}}>
        {Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
      </select>
      <select className="select w-20" value={jd}
        onChange={(e)=>{const d=+e.target.value; onChange(jalaliStrToIso(`${jy}/${String(jm).padStart(2,"0")}/${String(d).padStart(2,"0")}`));}}>
        {Array.from({length:jMonthLength(jy,jm)},(_,i)=>i+1).map(d=><option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
      </select>
    </div>
  );
}

/* آیکن‌های کوچک */
const IcDone = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
const IcOut  = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 12H8m0 0 4 4m-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);

type Props = { initial?: Partial<Part>; defaults: Settings; onSubmit: (p: Part) => void; onCancel: () => void; };

export default function PartFormCompact({ initial, defaults, onSubmit, onCancel }: Props) {
  const [receivedDate, setReceivedDate] = useState(initial?.receivedDate ?? todayISO());

  // تاریخ‌های فشرده: تکمیل/تحویل در یک خط
  const [hasCompleted, setHasCompleted] = useState(!!initial?.completedDate);
  const [completedDate, setCompletedDate] = useState(initial?.completedDate ?? "");
  const [hasDelivered, setHasDelivered] = useState(!!initial?.deliveredDate);
  const [deliveredDate, setDeliveredDate] = useState(initial?.deliveredDate ?? "");

  const [partName, setPartName] = useState(initial?.partName ?? "");
  const [customerName, setCustomerName] = useState(initial?.customerName ?? "");
  const [faultDesc, setFaultDesc] = useState(initial?.faultDesc ?? "");

  const baseTechs = ["دیجی‌بورده","دیجی‌برد پرو","Ordi Service"];
  const [techList, setTechList] = useState<string[]>(baseTechs);
  const [technicianName, setTechnicianName] = useState(initial?.technicianName ?? defaults.defaultTechnicianName);
  const [useCustomTech, setUseCustomTech] = useState(false);

  const [customerOpts, setCustomerOpts] = useState<string[]>([]);
  const [partOpts, setPartOpts] = useState<string[]>([]);
  useEffect(() => {
    Promise.all([distinctTechnicians?.(), distinctCustomers?.(), distinctPartNames?.()])
      .then(([techs, custs, parts]) => {
        if (techs?.length) setTechList(Array.from(new Set([...baseTechs, defaults.defaultTechnicianName, ...techs])));
        if (custs?.length) setCustomerOpts(Array.from(new Set(custs)));
        if (parts?.length) setPartOpts(Array.from(new Set(parts)));
      })
      .catch(()=>{});
  }, [defaults.defaultTechnicianName]);

  const [techPriceText, setTechPriceText] = useState(initial?.techPrice ? new Intl.NumberFormat("fa-IR").format(initial.techPrice) : "");
  const techPrice = useMemo(() => {
    const n = parseMoneyInput(techPriceText);
    return isNaN(n) ? 0 : n;
  }, [techPriceText]);

  const [myMarginPct, setMyMarginPct] = useState(initial?.myMarginPct ?? defaults.defaultMyMarginPct);
  const [companyMarginPct, setCompanyMarginPct] = useState(initial?.companyMarginPct ?? defaults.defaultCompanyMarginPct);

  const [status, setStatus] = useState<Status>(initial?.status ?? "pending");
  const [settled, setSettled] = useState<boolean>(initial?.settled ?? false);
  const [severity, setSeverity] = useState<Severity>(initial?.severity ?? "normal");

  const [serial, setSerial] = useState(initial?.serial ?? "");
  const [invoiceNo, setInvoiceNo] = useState(initial?.invoiceNo ?? "");
  const [tags, setTags] = useState(initial?.tags?.join(",") ?? "");
  const [estimateDays, setEstimateDays] = useState<number | "">(initial?.estimateDays ?? "");
  const [warranty, setWarranty] = useState<boolean>(initial?.warranty ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const { myPrice, companyPrice } = useMemo(
    () => calcPrices(techPrice, Number(myMarginPct)||0, Number(companyMarginPct)||0),
    [techPrice, myMarginPct, companyMarginPct]
  );

  /* SelectPro options */
  const statusOpts: SelectOption[] = [{label:"در جریان", value:"pending"},{label:"تعمیر شده", value:"repaired"}];
  const severityOpts: SelectOption[] = [{label:"عادی", value:"normal"},{label:"فوری", value:"urgent"},{label:"خطرناک", value:"critical"}];
  const technicianOpts: SelectOption[] = [...Array.from(new Set(techList)).map(t=>({label:t,value:t})), {label:"سایر…",value:"__custom"}];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p: Part = {
      receivedDate,
      completedDate: hasCompleted ? (completedDate || todayISO()) : "",
      deliveredDate: hasDelivered ? (deliveredDate || todayISO()) : "",
      partName, customerName, faultDesc, technicianName,
      techPrice: techPrice || 0,
      myMarginPct: Number(myMarginPct)||0,
      companyMarginPct: Number(companyMarginPct)||0,
      myPrice, companyPrice, status, settled, severity,
      serial, invoiceNo, tags: tags ? tags.split(",").map(s=>s.trim()).filter(Boolean) : [],
      estimateDays: estimateDays==="" ? null : Number(estimateDays), warranty, notes,
      updatedAt: new Date().toISOString()
    };
    onSubmit(p);
  }

  return (
    <form className="grid grid-cols-1 lg:grid-cols-2 gap-4" onSubmit={handleSubmit}>
      {/* ستون 1 — مینیمال */}
      <div className="card p-4 space-y-3">
        {/* دریافت (یک خط) */}
        <div>
          <div className="text-xs opacity-80 mb-1">تاریخ دریافت</div>
          <MiniJalali value={receivedDate} onChange={setReceivedDate}/>
        </div>

        {/* تکمیل و تحویل در یک خط */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={hasCompleted} onChange={(e)=>{ setHasCompleted(e.target.checked); if (e.target.checked && !completedDate) setCompletedDate(todayISO()); }}/>
            <div className="text-xs opacity-80 flex items-center gap-1"><IcDone/> تکمیل</div>
            {hasCompleted && <MiniJalali value={completedDate} onChange={setCompletedDate}/>}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={hasDelivered} onChange={(e)=>{ setHasDelivered(e.target.checked); if (e.target.checked && !deliveredDate) setDeliveredDate(todayISO()); }}/>
            <div className="text-xs opacity-80 flex items-center gap-1"><IcOut/> تحویل</div>
            {hasDelivered && <MiniJalali value={deliveredDate} onChange={setDeliveredDate}/>}
          </div>
        </div>

        {/* نام قطعه / مشتری / عیب */}
        <label className="text-sm">نام قطعه
          <input list="parts-suggest" className="input mt-1" value={partName} onChange={(e)=>setPartName(e.target.value)} required/>
          <datalist id="parts-suggest">{partOpts.map((p,i)=><option key={i} value={p}/>)}</datalist>
        </label>
        <label className="text-sm">نام مشتری
          <input list="cust-suggest" className="input mt-1" value={customerName} onChange={(e)=>setCustomerName(e.target.value)} required/>
          <datalist id="cust-suggest">{customerOpts.map((c,i)=><option key={i} value={c}/>)}</datalist>
        </label>
        <label className="text-sm">توضیح عیب
          <textarea className="textarea mt-1" rows={3} value={faultDesc} onChange={(e)=>setFaultDesc(e.target.value)}/>
        </label>

        {/* تعمیرکننده — SelectPro (بدون سرچ) */}
        {!useCustomTech ? (
          <div>
            <div className="text-sm mb-1">تعمیرکننده</div>
            <SelectPro options={technicianOpts} value={technicianName} onChange={(v:string)=> v==="__custom" ? (setUseCustomTech(true), setTechnicianName("")) : setTechnicianName(v)} />
          </div>
        ) : (
          <label className="text-sm">تعمیرکننده (سفارشی)
            <div className="flex gap-2 mt-1">
              <input className="input w-full" value={technicianName} onChange={(e)=>setTechnicianName(e.target.value)} placeholder="نام تعمیرکننده"/>
              <button type="button" className="btn btn-tone" onClick={()=>setUseCustomTech(false)}>بازگشت</button>
            </div>
          </label>
        )}
      </div>

      {/* ستون 2 — قیمت/وضعیت/فیلدهای اضافی */}
      <div className="card p-4 space-y-3">
        <label className="text-sm">قیمت تعمیر
          <input className="input mt-1" inputMode="numeric" placeholder="" value={techPriceText}
                 onChange={(e)=> setTechPriceText(formatInputLive(e.target.value))}
                 onBlur={(e)=> setTechPriceText(formatInputLive(e.target.value))}/>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">سود شما (%)
            <input className="input mt-1" type="number" step="0.1" value={myMarginPct} onChange={(e)=>setMyMarginPct(+e.target.value)}/>
          </label>
          <label className="text-sm">سود شرکت (%)
            <input className="input mt-1" type="number" step="0.1" value={companyMarginPct} onChange={(e)=>setCompanyMarginPct(+e.target.value)}/>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PriceBadge label="قیمت من" value={myPrice} currency={defaults.currency}/>
          <PriceBadge label="قیمت نهایی" value={companyPrice} currency={defaults.currency}/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><div className="text-sm mb-1">وضعیت</div><SelectPro options={statusOpts} value={status} onChange={(v)=>setStatus(v as any)}/></div>
          <div><div className="text-sm mb-1">اولویت</div><SelectPro options={severityOpts} value={severity} onChange={(v)=>setSeverity(v as any)}/></div>
        </div>

        {/* فیلدهای دائمی */}
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">سریال قطعه
            <input className="input mt-1" value={serial} onChange={(e)=>setSerial(e.target.value)}/>
          </label>
          <label className="text-sm">شماره فاکتور
            <input className="input mt-1" value={invoiceNo} onChange={(e)=>setInvoiceNo(e.target.value)}/>
          </label>
        </div>
        <label className="text-sm">برچسب‌ها (با کاما جدا کن)
          <input className="input mt-1" value={tags} onChange={(e)=>setTags(e.target.value)}/>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">برآورد مدت (روز)
            <input className="input mt-1" type="number" value={estimateDays as any} onChange={(e)=>setEstimateDays(e.target.value===""?"":+e.target.value)}/>
          </label>
          <label className="inline-flex items-center gap-2 text-sm mt-7">
            <input type="checkbox" checked={warranty} onChange={(e)=>setWarranty(e.target.checked)}/> گارانتی دارد
          </label>
        </div>
        <label className="text-sm">یادداشت
          <textarea className="textarea mt-1" rows={3} value={notes} onChange={(e)=>setNotes(e.target.value)}/>
        </label>

        <div className="flex gap-2 pt-2">
          <button className="btn btn-primary" type="submit">ذخیره</button>
          <button className="btn btn-tone" type="button" onClick={onCancel}>انصراف</button>
        </div>
      </div>
    </form>
  );
}

// کمکی — برای پارس ورودی پول
function parseMoneyInput(input: string): number {
  const fa2en: Record<string,string> = {"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","٫":".","٬":",","،":","};
  const en = (input||"").replace(/[۰-۹٫٬،]/g,(ch)=>fa2en[ch]??ch).replace(/[,\s]/g,"");
  const n = Number(en); return isNaN(n)? 0: n;
}
