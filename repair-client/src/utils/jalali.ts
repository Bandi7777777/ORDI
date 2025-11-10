// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\utils\jalali.ts
import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";

/** ISO → "YYYY/MM/DD" (جلالی) */
export function isoToJalaliStr(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const { jy, jm, jd } = toJalaali(y, m, d);
  return `${jy.toString().padStart(4,"0")}/${jm.toString().padStart(2,"0")}/${jd.toString().padStart(2,"0")}`;
}
export function fromISOToJalaliYMD(iso: string) { return isoToJalaliStr(iso); }

/** "YYYY/MM/DD" جلالی → ISO "YYYY-MM-DD" */
export function jalaliStrToIso(j: string): string {
  const [jy, jm, jd] = j.split(/[\/\-.]/).map(Number);
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return `${gy.toString().padStart(4,"0")}-${String(gm).padStart(2,"0")}-${String(gd).padStart(2,"0")}`;
}
export function jMonthLength(jy: number, jm: number){ return jalaaliMonthLength(jy, jm); }
export function todayISO(){ const t=new Date(); const y=t.getFullYear(), m=t.getMonth()+1, d=t.getDate(); return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }
export function todayJalaliYMD(){ const t=new Date(); const {jy,jm,jd}=toJalaali(t.getFullYear(),t.getMonth()+1,t.getDate()); return `${jy}-${String(jm).padStart(2,"0")}-${String(jd).padStart(2,"0")}`; }
export function fromISOtoJalaliLabel(iso?: string){ return iso? isoToJalaliStr(iso): "-"; }
