// @ts-nocheck
import React, { useState } from "react";

type Props = {
  initial: any;
  onSave: (patch: any) => void;
};

const SettingsPanel: React.FC<Props> = ({ initial, onSave }) => {
  const [myMargin, setMyMargin] = useState(initial.myMarginPct ?? 20);
  const [companyMargin, setCompanyMargin] = useState(
    initial.companyMarginPct ?? 10
  );
  const [currency, setCurrency] = useState(initial.currency ?? "TOMAN");

  // پیدا کردن کلید مربوط به «تعمیرکننده پیش‌فرض» به‌صورت داینامیک
  const techKey =
    Object.keys(initial).find((k) =>
      k.toLowerCase().includes("tech")
    ) ?? "defaultTechName";

  const baseTechString = (initial[techKey] as string) || "";
  const parsedTechs = baseTechString
    .split(/[،,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const [techList, setTechList] = useState<string[]>(
    parsedTechs.length ? parsedTechs : []
  );
  const [newTech, setNewTech] = useState("");

  const addTech = () => {
    const name = newTech.trim();
    if (!name) return;
    if (techList.includes(name)) {
      setNewTech("");
      return;
    }
    setTechList([...techList, name]);
    setNewTech("");
  };

  const removeTech = (name: string) => {
    setTechList((prev) => prev.filter((t) => t !== name));
  };

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    const techString = techList.join("، ");
    const patch: any = {
      myMarginPct: Number(myMargin) || 0,
      companyMarginPct: Number(companyMargin) || 0,
      currency,
      [techKey]: techString,
    };
    onSave(patch);
  };

  return (
    <form className="card p-4 space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-base font-semibold mb-1">تنظیمات</h2>

      {/* سودها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs opacity-80 mb-1 block">
            سود پیش‌فرض شما (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="input"
            value={myMargin}
            onChange={(e) => setMyMargin(e.target.valueAsNumber)}
          />
        </div>
        <div>
          <label className="text-xs opacity-80 mb-1 block">
            سود پیش‌فرض شرکت (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="input"
            value={companyMargin}
            onChange={(e) => setCompanyMargin(e.target.valueAsNumber)}
          />
        </div>
      </div>

      {/* واحد پول */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs opacity-80 mb-1 block">واحد پول</label>
          <select
            className="select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="TOMAN">تومان</option>
            <option value="IRR">ریال</option>
            <option value="EUR">یورو</option>
          </select>
        </div>
      </div>

      {/* لیست تعمیرکننده‌ها */}
      <div className="space-y-2">
        <label className="text-xs opacity-80 mb-1 block">
          تعمیرکننده‌های موجود
          <span className="opacity-60">
            {" "}
            (اولین مورد به‌عنوان پیش‌فرض استفاده می‌شود)
          </span>
        </label>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="نام تعمیرکننده جدید"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-tone text-xs"
            onClick={addTech}
          >
            افزودن
          </button>
        </div>
        {techList.length === 0 ? (
          <p className="text-xs opacity-70 mt-1">
            هنوز تعمیرکننده‌ای ثبت نشده. یک نام وارد کنید و روی «افزودن» بزنید.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {techList.map((t) => (
              <span
                key={t}
                className="chip chip--cyan flex items-center gap-1"
              >
                <span>{t}</span>
                <button
                  type="button"
                  className="text-[10px] opacity-80 hover:opacity-100"
                  onClick={() => removeTech(t)}
                  title="حذف تعمیرکننده"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button type="submit" className="btn btn-primary text-xs">
          ذخیره تنظیمات
        </button>
      </div>
    </form>
  );
};

export default SettingsPanel;
