// @ts-nocheck
import React from "react";
import type { Part } from "../types";
import DashboardChart from "./DashboardChart";

type FiltersPatch = Partial<{
  status: string;
  settled: string;
  dateType: "received" | "completed" | "delivered";
  severity: string;
}>;

type View = "list" | "orders" | "dashboard" | "settings";

type Props = {
  parts: Part[];
  currency: string;
  onGo: (view: View) => void;
  onQuickFilter: (patch: FiltersPatch) => void;
};

const Dashboard: React.FC<Props> = ({
  parts,
  currency,
  onGo,
  onQuickFilter,
}) => {
  const total = parts.length;
  const pending = parts.filter((p) => p.status === "pending").length;
  const repaired = parts.filter((p) => p.status === "repaired").length;
  const delivered = parts.filter(
    (p) => p.status === "repaired" && p.deliveredDate
  ).length;
  const unsettledParts = parts.filter((p) => !p.settled);

  const unsettledAmount = unsettledParts.reduce(
    (sum, p) => sum + (p.companyPrice ?? 0),
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
          ← بازگشت به خانه
        </button>
      </div>

      <div className="tiles mb-4">
        <button
          type="button"
          className="tile text-right"
          onClick={() =>
            onQuickFilter({
              status: "",
              settled: "",
              severity: "",
              dateType: "received",
            })
          }
        >
          <div className="k">کل رکوردها</div>
          <div className="v">{total}</div>
        </button>

        <button
          type="button"
          className="tile text-right"
          onClick={() =>
            onQuickFilter({
              status: "pending",
              settled: "",
              severity: "",
              dateType: "received",
            })
          }
        >
          <div className="k">در جریان</div>
          <div className="v">{pending}</div>
          <div className="mt-1 text-[0.7rem] opacity-75">
            با کلیک، سفارش‌های در جریان در صفحه «سفارش‌ها» نمایش داده می‌شوند.
          </div>
        </button>

        <button
          type="button"
          className="tile text-right"
          onClick={() =>
            onQuickFilter({
              status: "repaired",
              settled: "",
              severity: "",
              dateType: "completed",
            })
          }
        >
          <div className="k">تعمیر شده</div>
          <div className="v">{repaired}</div>
        </button>

        <button
          type="button"
          className="tile text-right"
          onClick={() =>
            onQuickFilter({
              status: "repaired",
              settled: "",
              severity: "",
              dateType: "delivered",
            })
          }
        >
          <div className="k">تحویل شده</div>
          <div className="v">{delivered}</div>
          <div className="mt-1 text-[0.7rem] opacity-75">
            سفارش‌هایی که تاریخ تحویل ثبت شده دارند.
          </div>
        </button>

        <button
          type="button"
          className="tile text-right"
          onClick={() =>
            onQuickFilter({
              status: "",
              settled: "no",
              severity: "",
              dateType: "received",
            })
          }
        >
          <div className="k">مبلغ تسویه‌نشده</div>
          <div className="v text-sm leading-tight">
            {money(unsettledAmount)}
          </div>
          <div className="mt-1 text-[0.7rem] opacity-75">
            {unsettledParts.length} سفارش تسویه‌نشده
          </div>
        </button>

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

      <DashboardChart parts={parts} />
    </div>
  );
};

export default Dashboard;
