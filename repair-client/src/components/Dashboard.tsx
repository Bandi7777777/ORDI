// مسیر: repair-client/src/components/Dashboard.tsx

import React from "react";
import type { Part } from "../types";

type FiltersPatch = Partial<{
  status: string;
  settled: string;
  dateType: "received" | "completed" | "delivered";
}>;

type View = "list" | "dashboard" | "settings";

type Props = {
  parts: Part[];
  currency: string;
  onGo: (view: View) => void;
  onQuickFilter: (patch: FiltersPatch) => void;
};

export default function Dashboard({
  parts,
  currency,
  onGo,
  onQuickFilter,
}: Props) {
  const total = parts.length;
  const pending = parts.filter((p) => p.status === "pending").length;
  const repaired = parts.filter((p) => p.status === "repaired").length;
  const delivered = parts.filter((p) => p.deliveredDate).length;
  const unsettled = parts.filter((p) => !p.settled);

  const unsettledAmount = unsettled.reduce(
    (sum, p) => sum + (p.finalPrice ?? 0),
    0
  );

  const avgRepairDays = (() => {
    const durations = parts
      .filter((p) => p.receivedDate && p.completedDate)
      .map((p) => {
        const start = new Date(p.receivedDate!).getTime();
        const end = new Date(p.completedDate!).getTime();
        return (end - start) / (1000 * 60 * 60 * 24);
      })
      .filter((d) => Number.isFinite(d) && d >= 0);

    if (!durations.length) return null;
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    return Math.round(avg * 10) / 10;
  })();

  const money = (v: number) =>
    `${v.toLocaleString("fa-IR")} ${
      currency === "TOMAN" ? "تومان" : currency
    }`;

  return (
    <div className="animate-slideIn">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold mb-1">داشبورد تعمیرات</h2>
          <p className="text-xs opacity-75">
            نمای کلی وضعیت سفارش‌ها، تحویل‌ها و تسویه‌ها.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-tone text-xs"
          onClick={() => onGo("list")}
        >
          ← بازگشت به لیست
        </button>
      </div>

      <div className="tiles mb-4">
        {/* کل رکوردها */}
        <button
          type="button"
          className="tile text-right"
          onClick={() => onQuickFilter({ status: "", settled: "" })}
        >
          <div className="k">کل رکوردها</div>
          <div className="v">{total}</div>
        </button>

        {/* در جریان */}
        <button
          type="button"
          className="tile text-right"
          onClick={() => onQuickFilter({ status: "pending" })}
        >
          <div className="k">در جریان</div>
          <div className="v">{pending}</div>
          <div className="mt-1 text-[0.7rem] opacity-75">
            با کلیک، فقط رکوردهای در جریان فیلتر می‌شوند.
          </div>
        </button>

        {/* تعمیر شده */}
        <button
          type="button"
          className="tile text-right"
          onClick={() =>
            onQuickFilter({ status: "repaired", dateType: "completed" })
          }
        >
          <div className="k">تعمیر شده</div>
          <div className="v">{repaired}</div>
        </button>

        {/* تحویل شده (جدید) */}
        <button
          type="button"
          className="tile text-right"
          onClick={() =>
            onQuickFilter({ status: "repaired", dateType: "delivered" })
          }
        >
          <div className="k">تحویل شده</div>
          <div className="v">{delivered}</div>
          <div className="mt-1 text-[0.7rem] opacity-75">
            سفارش‌هایی که تاریخ تحویل ثبت شده دارند.
          </div>
        </button>

        {/* مبلغ تسویه‌نشده */}
        <button
          type="button"
          className="tile text-right"
          onClick={() => onQuickFilter({ settled: "no" })}
        >
          <div className="k">مبلغ تسویه‌نشده</div>
          <div className="v text-sm leading-tight">
            {money(unsettledAmount)}
          </div>
          <div className="mt-1 text-[0.7rem] opacity-75">
            {unsettled.length} سفارش تسویه‌نشده
          </div>
        </button>

        {/* میانگین زمان تعمیر */}
        <div className="tile text-right">
          <div className="k">میانگین زمان تعمیر</div>
          <div className="v text-2xl">
            {avgRepairDays != null ? avgRepairDays : "—"}
          </div>
          <div className="mt-1 text-[0.7rem] opacity-75">
            بر اساس رکوردهایی که تاریخ دریافت و تکمیل دارند (روز).
          </div>
        </div>
      </div>
    </div>
  );
}
