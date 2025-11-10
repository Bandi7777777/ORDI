// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\utils\format.ts
import type { Currency } from "../types";

/** تنها منبع رسمی فرمت پول */
export function formatMoney(value: number, currency: Currency = "TOMAN", usePersianDigits = true){
  const n = Number.isFinite(value) ? value : 0;
  if (currency === "USD") return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(n);
  if (currency === "EUR") return new Intl.NumberFormat("de-DE",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(n);
  const txt = new Intl.NumberFormat(usePersianDigits?"fa-IR":"en-US",{maximumFractionDigits:0}).format(n);
  return `${txt} تومان`;
}
export function formatInputLive(raw: string){
  const fa2en: Record<string,string> = {"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","٫":".","٬":",","،":","};
  let norm = raw.replace(/[۰-۹٫٬،]/g,(ch)=>fa2en[ch]??ch).replace(/[^\d.]/g,"");
  const parts = norm.split(".");
  if (parts.length>2) norm = parts[0]+"."+parts.slice(1).join("");
  const [i,d] = norm.split(".");
  const withSep = i ? Number(i).toLocaleString("fa-IR") : "";
  return d!=null ? `${withSep}${d? "٫"+d.replace(/[^\d۰-۹]/g,""):""}` : withSep;
}
export function parseMoneyInput(input: string){
  if(!input) return NaN;
  const fa2en: Record<string,string> = {"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","٫":".","٬":",","،":","};
  const en = input.replace(/[۰-۹٫٬،]/g,(ch)=>fa2en[ch]??ch).replace(/[,\s]/g,"");
  const n = Number(en); return isNaN(n)? NaN: n;
}
export function formatJalaliDate(d: Date | string | number){
  const date = d instanceof Date ? d : new Date(d);
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian",{year:"numeric",month:"2-digit",day:"2-digit"}).format(date).replaceAll("-","/");
}
