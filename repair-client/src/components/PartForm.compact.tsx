import { useEffect, useMemo, useState } from "react";
import type { Part, Severity, Status, Settings } from "../types";
import { calcPrices } from "../utils/calc";
import { PriceBadge } from "./PriceBadge";
import { formatInputLive, parseMoneyInput } from "../utils/format";
import {
  distinctTechnicians,
  distinctCustomers,
  distinctPartNames,
} from "../lib/db";
import {
  isoToJalaliStr,
  jalaliStrToIso,
  jMonthLength,
  todayISO,
} from "../utils/jalali";
import SelectPro, { SelectOption } from "./ui/SelectPro";

/* ---------- Mini Jalali (compact) ---------- */
function MiniJalali({
  label,
  value,
  onChange,
}: {
  label?: string;
  value?: string;
  onChange: (iso: string) => void;
}) {
  const iso = value || todayISO();
  const j = isoToJalaliStr(iso); // "YYYY/MM/DD"
  const jy = +j.slice(0, 4);
  const jm = +j.slice(5, 7);
  const jd = +j.slice(8, 10);

  const years = useMemo(() => {
    const yNow = +isoToJalaliStr(todayISO()).slice(0, 4);
    const arr: number[] = [];
    for (let y = yNow - 6; y <= yNow + 2; y++) arr.push(y);
    return arr.reverse();
  }, []);

  function setJ(y: number, m: number, d: number) {
    const md = Math.min(d, jMonthLength(y, m));
    onChange(jalaliStrToIso(`${y}/${String(m).padStart(2, "0")}/${String(md).padStart(2, "0")}`));
  }

  return (
    <div className="flex items-end gap-2">
      {label && <div className="text-xs opacity-75">{label}</div>}
      <select
        className="select w-24"
        value={jy}
        onChange={(e) => setJ(+e.target.value, jm, jd)}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        className="select w-20"
        value={jm}
        onChange={(e) => setJ(jy, +e.target.value, jd)}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
      <select
        className="select w-20"
        value={jd}
        onChange={(e) => setJ(jy, jm, +e.target.value)}
      >
        {Array.from({ length: jMonthLength(jy, jm) }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {String(d).padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------- Icons (tiny) ---------- */
const IcDone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IcOut = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 12H8m0 0 4 4m-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type Props = {
  initial?: Partial<Part>;
  defaults: Settings;
  onSubmit: (p: Part) => void;
  onCancel: () => void;
};

export default function PartFormCompact({ initial, defaults, onSubmit, onCancel }: Props) {
  /* ---------- Dates ---------- */
  const [receivedDate, setReceivedDate] = useState<string>(
    initial?.receivedDate ?? todayISO()
  );
  const [hasCompleted, setHasCompleted] = useState<boolean>(!!initial?.completedDate);
  const [completedDate, setCompletedDate] = useState<string>(initial?.completedDate ?? "");
  const [hasDelivered, setHasDelivered] = useState<boolean>(!!initial?.deliveredDate);
  const [deliveredDate, setDeliveredDate] = useState<string>(initial?.deliveredDate ?? "");

  /* ---------- Basics ---------- */
  const [partName, setPartName] = useState<string>(initial?.partName ?? "");
  const [customerName, setCustomerName] = useState<string>(initial?.customerName ?? "");
  const [faultDesc, setFaultDesc] = useState<string>(initial?.faultDesc ?? "");

  /* ---------- Technician (SelectPro + custom) ---------- */
  const baseTechs = ["دیجی‌بورده", "دیجی‌برد پرو", "Ordi Service"];
  const [techList, setTechList] = useState<string[]>(baseTechs);
  const [technicianName, setTechnicianName] = useState<string>(
    initial?.technicianName ?? defaults.defaultTechnicianName
  );
  const [useCustomTech, setUseCustomTech] = useState(false);

  const [customerOpts, setCustomerOpts] = useState<string[]>([]);
  const [partOpts, setPartOpts] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([distinctTechnicians?.(), distinctCustomers?.(), distinctPartNames?.()])
      .then(([t, c, p]) => {
        if (t?.length) {
          const uniq = Array.from(
            new Set([...baseTechs, defaults.defaultTechnicianName, ...t])
          );
          setTechList(uniq);
        }
        if (c?.length) setCustomerOpts(Array.from(new Set(c)));
        if (p?.length) setPartOpts(Array.from(new Set(p)));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Pricing ---------- */
  const [techPriceText, setTechPriceText] = useState<string>(
    initial?.techPrice ? new Intl.NumberFormat("fa-IR").format(initial.techPrice) : ""
  );
  const techPrice = useMemo<number>(() => {
    const n = parseMoneyInput(techPriceText);
    return isNaN(n) ? 0 : n;
  }, [techPriceText]);

  const [myMarginPct, setMyMarginPct] = useState<number>(
    initial?.myMarginPct ?? defaults.defaultMyMarginPct
  );
  const [companyMarginPct, setCompanyMarginPct] = useState<number>(
    initial?.companyMarginPct ?? defaults.defaultCompanyMarginPct
  );

  const { myPrice, companyPrice } = useMemo(
    () => calcPrices(techPrice, Number(myMarginPct) || 0, Number(companyMarginPct) || 0),
    [techPrice, myMarginPct, companyMarginPct]
  );

  /* ---------- Status ---------- */
  const [status, setStatus] = useState<Status>(initial?.status ?? "pending");
  const [settled, setSettled] = useState<boolean>(initial?.settled ?? false);
  const [severity, setSeverity] = useState<Severity>(initial?.severity ?? "normal");

  /* ---------- Extra fields ---------- */
  const [serial, setSerial] = useState<string>(initial?.serial ?? "");
  const [invoiceNo, setInvoiceNo] = useState<string>(initial?.invoiceNo ?? "");
  const [tags, setTags] = useState<string>(initial?.tags?.join(",") ?? "");
  const [estimateDays, setEstimateDays] = useState<number | "">(initial?.estimateDays ?? "");
  const [warranty, setWarranty] = useState<boolean>(initial?.warranty ?? false);
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");

  /* ---------- SelectPro options ---------- */
  const techOpts: SelectOption[] = [
    ...techList.map((t) => ({ label: t, value: t })),
    { label: "سایر…", value: "__custom" },
  ];
  const statusOpts: SelectOption[] = [
    { label: "در جریان", value: "pending" },
    { label: "تعمیر شده", value: "repaired" },
  ];
  const sevOpts: SelectOption[] = [
    { label: "عادی", value: "normal" },
    { label: "فوری", value: "urgent" },
    { label: "بحرانی", value: "critical" },
  ];

  /* ---------- Submit ---------- */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const p: Part = {
      receivedDate,
      completedDate: hasCompleted ? (completedDate || todayISO()) : "",
      deliveredDate: hasDelivered ? (deliveredDate || todayISO()) : "",
      partName,
      customerName,
      faultDesc,
      technicianName,
      techPrice: techPrice || 0,
      myMarginPct: Number(myMarginPct) || 0,
      companyMarginPct: Number(companyMarginPct) || 0,
      myPrice,
      companyPrice,
      status,
      settled,
      severity,
      serial,
      invoiceNo,
      tags: tags
        ? tags.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      estimateDays: estimateDays === "" ? null : Number(estimateDays),
      warranty,
      notes,
      updatedAt: new Date().toISOString(),
    };
    onSubmit(p);
  }

  return (
    <form className="grid grid-cols-1 lg:grid-cols-2 gap-4" onSubmit={handleSubmit}>
      {/* ستون ۱ */}
      <div className="card p-4 space-y-3">
        {/* ردیف فشرده تاریخ‌ها: دریافت | (تکمیل) | (تحویل) */}
        <div className="flex flex-wrap items-end gap-4">
          <MiniJalali label="دریافت" value={receivedDate} onChange={setReceivedDate} />
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={hasCompleted}
                onChange={(e) => {
                  setHasCompleted(e.target.checked);
                  if (e.target.checked && !completedDate) setCompletedDate(todayISO());
                }}
              />
              <span className="opacity-80 flex items-center gap-1"><IcDone /> تکمیل</span>
            </label>
            {hasCompleted && (
              <MiniJalali value={completedDate} onChange={setCompletedDate} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={hasDelivered}
                onChange={(e) => {
                  setHasDelivered(e.target.checked);
                  if (e.target.checked && !deliveredDate) setDeliveredDate(todayISO());
                }}
              />
              <span className="opacity-80 flex items-center gap-1"><IcOut /> تحویل</span>
            </label>
            {hasDelivered && (
              <MiniJalali value={deliveredDate} onChange={setDeliveredDate} />
            )}
          </div>
        </div>

        <label className="text-sm">نام قطعه
          <input
            list="parts-suggest"
            className="input mt-1"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            required
          />
          <datalist id="parts-suggest">
            {partOpts.map((p, i) => (
              <option key={i} value={p} />
            ))}
          </datalist>
        </label>

        <label className="text-sm">نام مشتری
          <input
            list="cust-suggest"
            className="input mt-1"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <datalist id="cust-suggest">
            {customerOpts.map((c, i) => (
              <option key={i} value={c} />
            ))}
          </datalist>
        </label>

        <label className="text-sm">توضیح عیب
          <textarea
            className="textarea mt-1"
            rows={2}
            value={faultDesc}
            onChange={(e) => setFaultDesc(e.target.value)}
          />
        </label>

        {/* تعمیرکننده */}
        {!useCustomTech ? (
          <div>
            <div className="text-sm mb-1">تعمیرکننده</div>
            <SelectPro
              value={technicianName}
              onChange={(v: string) => {
                if (v === "__custom") {
                  setUseCustomTech(true);
                  setTechnicianName("");
                } else setTechnicianName(v);
              }}
              options={techOpts}
              ariaLabel="تعمیرکننده"
            />
          </div>
        ) : (
          <label className="text-sm">تعمیرکننده (سفارشی)
            <div className="flex gap-2 mt-1">
              <input
                className="input w-full"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="نام تعمیرکننده"
              />
              <button
                type="button"
                className="btn btn-tone"
                onClick={() => setUseCustomTech(false)}
              >
                بازگشت
              </button>
            </div>
          </label>
        )}
      </div>

      {/* ستون ۲ */}
      <div className="card p-4 space-y-3">
        <label className="text-sm">قیمت تعمیر
          <input
            className="input mt-1"
            inputMode="numeric"
            placeholder=""
            value={techPriceText}
            onChange={(e) => setTechPriceText(formatInputLive(e.target.value))}
            onBlur={(e) => setTechPriceText(formatInputLive(e.target.value))}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">سود شما (%)
            <input
              className="input mt-1"
              type="number"
              step="0.1"
              value={myMarginPct}
              onChange={(e) => setMyMarginPct(+e.target.value)}
            />
          </label>
          <label className="text-sm">سود شرکت (%)
            <input
              className="input mt-1"
              type="number"
              step="0.1"
              value={companyMarginPct}
              onChange={(e) => setCompanyMarginPct(+e.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PriceBadge label="قیمت من" value={myPrice} currency={defaults.currency} />
          <PriceBadge label="قیمت نهایی" value={companyPrice} currency={defaults.currency} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-sm mb-1">وضعیت</div>
            <SelectPro value={status} onChange={(v) => setStatus(v as Status)} options={statusOpts} />
          </div>
          <div>
            <div className="text-sm mb-1">اولویت</div>
            <SelectPro value={severity} onChange={(v) => setSeverity(v as Severity)} options={sevOpts} />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settled} onChange={(e) => setSettled(e.target.checked)} />
          تسویه شده
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">سریال
            <input className="input mt-1" value={serial} onChange={(e) => setSerial(e.target.value)} />
          </label>
          <label className="text-sm">شماره فاکتور
            <input className="input mt-1" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </label>
        </div>

        <label className="text-sm">برچسب‌ها (با کاما)
          <input className="input mt-1" value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">برآورد مدت (روز)
            <input
              className="input mt-1"
              type="number"
              value={estimateDays as any}
              onChange={(e) =>
                setEstimateDays(e.target.value === "" ? "" : +e.target.value)
              }
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={warranty}
              onChange={(e) => setWarranty(e.target.checked)}
            />
            گارانتی دارد
          </label>
        </div>

        <label className="text-sm">یادداشت
          <textarea
            className="textarea mt-1"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="flex gap-2 pt-2">
          <button className="btn btn-primary" type="submit">ذخیره</button>
          <button className="btn btn-ghost" type="button" onClick={onCancel}>انصراف</button>
        </div>
      </div>
    </form>
  );
}
