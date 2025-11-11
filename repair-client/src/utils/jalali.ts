import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";

/** ISO "YYYY-MM-DD" → "YYYY/MM/DD" (fa-IR) */
export function isoToJalaliStr(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const { jy, jm, jd } = toJalaali(y, m, d);
  return `${String(jy).padStart(4,"0")}/${String(jm).padStart(2,"0")}/${String(jd).padStart(2,"0")}`;
}

/** سازگار با نام‌هایی که قبلاً صدا زده می‌شد */
export const fromISOToJalaliYMD = isoToJalaliStr;

/** "YYYY/MM/DD" → ISO "YYYY-MM-DD" */
export function jalaliStrToIso(j: string): string {
  const [jy, jm, jd] = j.split(/[\/\-.]/).map(Number);
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return `${String(gy).padStart(4,"0")}-${String(gm).padStart(2,"0")}-${String(gd).padStart(2,"0")}`;
}

/** طول ماه جلالی */
export function jMonthLength(jy: number, jm: number) {
  return jalaaliMonthLength(jy, jm);
}

export function todayISO(): string {
  const t = new Date();
  const y = t.getFullYear(), m = t.getMonth() + 1, d = t.getDate();
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

export function todayJalaliYMD(): string {
  const t = new Date();
  const { jy, jm, jd } = toJalaali(t.getFullYear(), t.getMonth() + 1, t.getDate());
  return `${jy}-${String(jm).padStart(2,"0")}-${String(jd).padStart(2,"0")}`;
}

/** لیبل کمکی برای کنار ورودی‌ها */
export function fromISOtoJalaliLabel(iso?: string) {
  return iso ? isoToJalaliStr(iso) : "-";
}
