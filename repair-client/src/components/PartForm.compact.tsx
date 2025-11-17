// @ts-nocheck
import React, { useEffect, useState } from "react";
import type { Part, Settings } from "../types";

type Props = {
  initial?: Part | null;
  defaults: Settings;
  technicians?: string[];
  onSubmit: (p: Part) => void;
  onCancel: () => void;
};

type Draft = {
  partName: string;
  customerName: string;
  technicianName: string;
  severity: "normal" | "urgent" | "critical";
  status: "pending" | "repaired";
  receivedDate: string;
  completedDate: string;
  deliveredDate: string;
  techPrice: number;
  myPrice: number;
  companyPrice: number;
  myMarginPct: number;
  companyMarginPct: number;
  settled: boolean;
  faultDesc: string;
  notes: string;
};

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function calcPrices(
  techPrice: number,
  myPct: number,
  companyPct: number
): { myPrice: number; companyPrice: number } {
  const base = Number(techPrice) || 0;
  const m = Number(myPct) || 0;
  const c = Number(companyPct) || 0;
  const myPrice = Math.round(base * (1 + m / 100));
  const companyPrice = Math.round(myPrice * (1 + c / 100));
  return { myPrice, companyPrice };
}

function parseMoneyInput(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function formatMoney(value: number): string {
  if (!value || !Number.isFinite(value)) return "0";
  return value.toLocaleString("fa-IR");
}

const PartForm: React.FC<Props> = ({
  initial,
  defaults,
  technicians = [],
  onSubmit,
  onCancel,
}) => {
  const baseMyPct = defaults.myMarginPct ?? 0;
  const baseCompPct = defaults.companyMarginPct ?? 0;

  const [draft, setDraft] = useState<Draft>(() => {
    if (initial) {
      const prices = calcPrices(
        initial.techPrice ?? 0,
        baseMyPct,
        baseCompPct
      );
      return {
        partName: initial.partName || "",
        customerName: initial.customerName || "",
        technicianName: initial.technicianName || "",
        severity: initial.severity || "normal",
        status: initial.status || "pending",
        receivedDate: initial.receivedDate || todayISO(),
        completedDate: initial.completedDate || "",
        deliveredDate: initial.deliveredDate || "",
        techPrice: initial.techPrice ?? 0,
        myPrice: initial.myPrice ?? prices.myPrice,
        companyPrice: initial.companyPrice ?? prices.companyPrice,
        myMarginPct: baseMyPct,
        companyMarginPct: baseCompPct,
        settled: !!initial.settled,
        faultDesc: initial.faultDesc || "",
        notes: initial.notes || "",
      };
    }
    const prices = calcPrices(0, baseMyPct, baseCompPct);
    return {
      partName: "",
      customerName: "",
      technicianName: technicians[0] || "",
      severity: "normal",
      status: "pending",
      receivedDate: todayISO(),
      completedDate: "",
      deliveredDate: "",
      techPrice: 0,
      myPrice: prices.myPrice,
      companyPrice: prices.companyPrice,
      myMarginPct: baseMyPct,
      companyMarginPct: baseCompPct,
      settled: false,
      faultDesc: "",
      notes: "",
    };
  });

  // رشته‌ی ورودی قیمت پایه (برای اینکه فرمت سه‌رقمی حین تایپ، caret رو خراب نکند)
  const [techPriceInput, setTechPriceInput] = useState<string>(
    draft.techPrice ? formatMoney(draft.techPrice) : ""
  );

  useEffect(() => {
    if (!draft.technicianName && technicians.length) {
      setDraft((d) => ({ ...d, technicianName: technicians[0] }));
    }
  }, [technicians]);

  const recalcWith = (
    tech: number,
    myPct = draft.myMarginPct,
    compPct = draft.companyMarginPct
  ) => {
    const prices = calcPrices(tech, myPct, compPct);
    setDraft((prev) => ({
      ...prev,
      techPrice: tech,
      myMarginPct: myPct,
      companyMarginPct: compPct,
      myPrice: prices.myPrice,
      companyPrice: prices.companyPrice,
    }));
  };

  const handleTechPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTechPriceInput(raw);
    const num = parseMoneyInput(raw);
    recalcWith(num);
  };

  const handleMyPctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value || 0);
    recalcWith(draft.techPrice, pct, draft.companyMarginPct);
  };

  const handleCompPctChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value || 0);
    recalcWith(draft.techPrice, draft.myMarginPct, pct);
  };

  const handleSeverityChange = (sev: Draft["severity"]) => {
    setDraft((prev) => ({ ...prev, severity: sev }));
  };

  const handleStatusChange = (st: Draft["status"]) => {
    setDraft((prev) => ({ ...prev, status: st }));
  };

  const handleText =
    (field: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setDraft((prev) => ({
        ...prev,
        [field]: value as any,
      }));
    };

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (!draft.partName.trim() || !draft.customerName.trim()) {
      alert("نام قطعه و نام مشتری الزامی هستند.");
      return;
    }

    const result: Part = {
      ...(initial || {}),
      partName: draft.partName.trim(),
      customerName: draft.customerName.trim(),
      technicianName: draft.technicianName.trim(),
      severity: draft.severity,
      status: draft.status,
      receivedDate: draft.receivedDate || todayISO(),
      completedDate: draft.completedDate || null,
      deliveredDate: draft.deliveredDate || null,
      techPrice: draft.techPrice,
      myPrice: draft.myPrice,
      companyPrice: draft.companyPrice,
      settled: draft.settled,
      faultDesc: draft.faultDesc.trim(),
      notes: draft.notes.trim(),
    } as any;

    onSubmit(result);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* ردیف 1: قطعه / مشتری */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs opacity-80 mb-1 block">نام قطعه</label>
          <input
            className="input"
            value={draft.partName}
            onChange={handleText("partName")}
            placeholder="مثلاً برد دوربین، پاور، مین‌بورد..."
          />
        </div>
        <div>
          <label className="text-xs opacity-80 mb-1 block">مشتری</label>
          <input
            className="input"
            value={draft.customerName}
            onChange={handleText("customerName")}
            placeholder="نام یا شرکت مشتری"
          />
        </div>
      </div>

      {/* ردیف 2: تعمیرکننده / شدت / وضعیت */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs opacity-80 mb-1 block">
            تعمیرکننده
          </label>
          {technicians.length ? (
            <select
              className="select"
              value={draft.technicianName}
              onChange={(e) =>
                setDraft((d) => ({ ...d, technicianName: e.target.value }))
              }
            >
              {technicians.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="input"
              value={draft.technicianName}
              onChange={handleText("technicianName")}
              placeholder="نام تعمیرکننده"
            />
          )}
        </div>

        <div>
          <label className="text-xs opacity-80 mb-1 block">اولویت</label>
          <div className="seg">
            <button
              type="button"
              className={
                "seg-btn" + (draft.severity === "normal" ? " active" : "")
              }
              onClick={() => handleSeverityChange("normal")}
            >
              عادی
            </button>
            <button
              type="button"
              className={
                "seg-btn" + (draft.severity === "urgent" ? " active" : "")
              }
              onClick={() => handleSeverityChange("urgent")}
            >
              فوری
            </button>
            <button
              type="button"
              className={
                "seg-btn" + (draft.severity === "critical" ? " active" : "")
              }
              onClick={() => handleSeverityChange("critical")}
            >
              بحرانی
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs opacity-80 mb-1 block">وضعیت</label>
          <div className="seg">
            <button
              type="button"
              className={
                "seg-btn" + (draft.status === "pending" ? " active" : "")
              }
              onClick={() => handleStatusChange("pending")}
            >
              در جریان
            </button>
            <button
              type="button"
              className={
                "seg-btn" + (draft.status === "repaired" ? " active" : "")
              }
              onClick={() => handleStatusChange("repaired")}
            >
              تعمیر شده
            </button>
          </div>
        </div>
      </div>

      {/* ردیف 3: توضیح عیب */}
      <div>
        <label className="text-xs opacity-80 mb-1 block">توضیح عیب</label>
        <textarea
          className="textarea"
          rows={2}
          value={draft.faultDesc}
          onChange={handleText("faultDesc")}
          placeholder="شرح مشکل یا نشانه‌های خرابی دستگاه..."
        />
      </div>

      {/* ردیف 4: تاریخ‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs opacity-80 mb-1 block">تاریخ دریافت</label>
          <input
            type="date"
            className="input"
            value={draft.receivedDate}
            onChange={handleText("receivedDate")}
          />
        </div>
        <div>
          <label className="text-xs opacity-80 mb-1 block">تاریخ تکمیل</label>
          <input
            type="date"
            className="input"
            value={draft.completedDate}
            onChange={handleText("completedDate")}
          />
        </div>
        <div>
          <label className="text-xs opacity-80 mb-1 block">تاریخ تحویل</label>
          <input
            type="date"
            className="input"
            value={draft.deliveredDate}
            onChange={handleText("deliveredDate")}
          />
        </div>
      </div>

      {/* ردیف 5: قیمت‌ها + درصدها */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs opacity-80 mb-1 block">
            قیمت تعمیر (مبلغ پایه)
          </label>
          <input
            type="text"
            className="input"
            value={techPriceInput}
            onChange={handleTechPriceChange}
            placeholder="مبلغ تعمیر به تومان"
          />
          <p className="text-[0.7rem] opacity-75 mt-1">
            نمایش: {formatMoney(draft.techPrice)} تومان
          </p>
        </div>
        <div>
          <label className="text-xs opacity-80 mb-1 block">
            درصد سود شما (%)
          </label>
          <input
            type="number"
            className="input"
            value={draft.myMarginPct}
            onChange={handleMyPctChange}
          />
          <p className="text-[0.7rem] opacity-70 mt-1">
            قیمت شما: {formatMoney(draft.myPrice)} تومان
          </p>
        </div>
        <div>
          <label className="text-xs opacity-80 mb-1 block">
            درصد سود شرکت (%)
          </label>
          <input
            type="number"
            className="input"
            value={draft.companyMarginPct}
            onChange={handleCompPctChange}
          />
          <p className="text-[0.7rem] opacity-70 mt-1">
            قیمت نهایی: {formatMoney(draft.companyPrice)} تومان
          </p>
        </div>
      </div>

      {/* ردیف 6: یادداشت و تسویه */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs opacity-80 mb-1 block">یادداشت</label>
          <textarea
            className="textarea"
            rows={2}
            value={draft.notes}
            onChange={handleText("notes")}
            placeholder="یادداشت داخلی درباره این سفارش..."
          />
        </div>
        <div className="flex flex-col justify-between gap-2">
          <label className="text-xs opacity-80 mb-1 block">وضعیت تسویه</label>
          <button
            type="button"
            className={
              "part-table__settle-btn " +
              (draft.settled
                ? "part-table__settle-btn--on"
                : "part-table__settle-btn--off")
            }
            onClick={() =>
              setDraft((d) => ({ ...d, settled: !d.settled }))
            }
          >
            {draft.settled ? "تسویه شد" : "تسویه نشده"}
          </button>
        </div>
      </div>

      {/* دکمه‌ها */}
      <div className="pt-3 flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-ghost text-xs"
          onClick={onCancel}
        >
          انصراف
        </button>
        <button type="submit" className="btn btn-primary text-xs">
          {isEdit ? "ذخیره تغییرات" : "ثبت قطعه"}
        </button>
      </div>
    </form>
  );
};

export default PartForm;
