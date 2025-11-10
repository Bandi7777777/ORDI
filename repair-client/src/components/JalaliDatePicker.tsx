// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\components\JalaliDatePicker.tsx
import { useEffect, useMemo, useState } from "react";
import { isoToJalaliStr, jalaliStrToIso, jMonthLength, todayISO } from "../utils/jalali";

type Props = { value?: string; onChange: (iso: string) => void; label?: string; };

export default function JalaliDatePicker({ value, onChange, label }: Props) {
  const [iso, setIso] = useState<string>(value || todayISO());
  const j = isoToJalaliStr(iso);

  const jy = +j.slice(0,4);
  const jm = +j.slice(5,7);
  const jd = +j.slice(8,10);

  const years = useMemo(()=> {
    const nowY = +isoToJalaliStr(todayISO()).slice(0,4);
    const arr:number[] = []; for (let y=nowY-6;y<=nowY+2;y++) arr.push(y);
    return arr.reverse();
  }, []);

  useEffect(()=>{ onChange(iso); },[iso, onChange]);

  return (
    <label className="text-sm">
      {label || "تاریخ (جلالی)"}
      <div className="flex gap-2 mt-1">
        <select className="select w-24" value={jy} onChange={(e)=>{
          const y = +e.target.value; const day = Math.min(jd, jMonthLength(y, jm));
          setIso(jalaliStrToIso(`${y}/${String(jm).padStart(2,"0")}/${String(day).padStart(2,"0")}`));
        }}>
          {years.map(y=> <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="select w-20" value={jm} onChange={(e)=>{
          const m = +e.target.value; const day = Math.min(jd, jMonthLength(jy, m));
          setIso(jalaliStrToIso(`${jy}/${String(m).padStart(2,"0")}/${String(day).padStart(2,"0")}`));
        }}>
          {Array.from({length:12},(_,i)=>i+1).map(m=> <option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
        </select>
        <select className="select w-20" value={jd} onChange={(e)=>{
          const d = +e.target.value;
          setIso(jalaliStrToIso(`${jy}/${String(jm).padStart(2,"0")}/${String(d).padStart(2,"0")}`));
        }}>
          {Array.from({length:jMonthLength(jy,jm)},(_,i)=>i+1).map(d=> <option key={d} value={d}>{String(d).padStart(2,"0")}</option>)}
        </select>
      </div>
    </label>
  );
}
