import { useEffect, useState } from "react";
import type { Settings, Theme, Palette } from "../types";

type Props = { initial: Settings; onSave: (patch: Partial<Settings>) => Promise<void>; };

export default function SettingsPanel({ initial, onSave }: Props) {
  const [form, setForm] = useState<Settings>(initial);
  useEffect(()=>setForm(initial),[initial]);

  async function handleSave(e: React.FormEvent){
    e.preventDefault();
    await onSave(form);
  }

  return (
    <div className="card p-4">
      <h2 className="text-base font-semibold mb-4">تنظیمات</h2>
      <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSave}>
        <label className="text-sm">سود پیش‌فرض شما (%)
          <input className="input mt-1" type="number" step="0.1" value={form.defaultMyMarginPct}
                 onChange={(e)=>setForm({...form, defaultMyMarginPct:+e.target.value})}/>
        </label>
        <label className="text-sm">سود پیش‌فرض شرکت (%)
          <input className="input mt-1" type="number" step="0.1" value={form.defaultCompanyMarginPct}
                 onChange={(e)=>setForm({...form, defaultCompanyMarginPct:+e.target.value})}/>
        </label>
        <label className="text-sm">تعمیرکنندهٔ پیش‌فرض
          <input className="input mt-1" value={form.defaultTechnicianName}
                 onChange={(e)=>setForm({...form, defaultTechnicianName:e.target.value})}/>
        </label>
        <label className="text-sm">واحد پول
          <select className="select mt-1" value={form.currency} onChange={(e)=>setForm({...form, currency: e.target.value as any})}>
            <option value="TOMAN">تومان</option>
            <option value="USD">دلار (USD)</option>
            <option value="EUR">یورو (EUR)</option>
          </select>
        </label>
        <label className="text-sm">تم
          <select className="select mt-1" value={form.theme} onChange={(e)=>setForm({...form, theme: e.target.value as Theme})}>
            <option value="system">سیستمی</option>
            <option value="light">روشن</option>
            <option value="dark">تیره</option>
          </select>
        </label>
        <label className="text-sm">پالت
          <select className="select mt-1" value={form.palette ?? "ink"} onChange={(e)=>setForm({...form, palette: e.target.value as Palette})}>
            <option value="ink">Ink (تیره نئونی)</option>
            <option value="prism">Prism (روشن رنگی)</option>
            <option value="sunset">Sunset (گرم)</option>
          </select>
        </label>

        <div className="md:col-span-2 flex gap-2">
          <button className="btn btn-primary" type="submit">ذخیره تنظیمات</button>
        </div>
      </form>
    </div>
  );
}
