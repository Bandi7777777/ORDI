// @ts-nocheck
import React from "react";
import type { Part, Currency } from "../types";
import { formatMoney } from "../utils/format";
import { StatusBadge, SeverityBadge } from "./StatusBadge";
import { renderInvoicePDF } from "../utils/invoice";

type Props = {
  parts: Part[];
  currency: Currency;
  onEdit: (p: Part) => void;
  onDelete: (id: number) => void;
  onToggleSettled: (p: Part) => void;
  onBack: () => void;
};

const OrdersPage: React.FC<Props> = ({
  parts,
  currency,
  onEdit,
  onDelete,
  onToggleSettled,
  onBack,
}) => {
  const hasItems = parts.length > 0;

  let contextLabel = "همه سفارش‌ها";
  if (hasItems) {
    const allPending = parts.every((p) => p.status === "pending");
    const allRepaired = parts.every((p) => p.status === "repaired");
    const allDelivered =
      allRepaired && parts.every((p) => !!p.deliveredDate);

    if (allDelivered) contextLabel = "سفارش‌های تحویل شده";
    else if (allRepaired) contextLabel = "سفارش‌های تعمیر شده";
    else if (allPending) contextLabel = "سفارش‌های در جریان";
  }

  return (
    <section>
      <header className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold mb-1">سفارش‌ها</h2>
          <p className="text-xs opacity-75">
            {contextLabel} — بر اساس فیلتر فعلی (از داشبورد یا فیلترها).
          </p>
        </div>
        <button
          type="button"
          className="btn btn-tone text-xs"
          onClick={onBack}
        >
          ← بازگشت به داشبورد
        </button>
      </header>

      {!hasItems ? (
        <div className="card p-4 text-center text-sm opacity-80">
          هیچ سفارشی مطابق فیلتر فعلی یافت نشد.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {parts.map((p) => (
            <article
              key={p.id ?? `${p.customerName}-${p.partName}`}
              className="card p-5 w-full max-w-5xl mx-auto flex flex-col gap-3"
            >
              {/* هدر کارت با نوار بالا */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-2">
                <div className="space-y-1">
                  <h3
                    className={`text-sm font-semibold ${
                      p.status === "pending"
                        ? "text-cyan-300"
                        : p.deliveredDate
                        ? "text-emerald-300"
                        : "text-indigo-300"
                    }`}
                  >
                    {p.id ? `سفارش #${p.id}` : "سفارش جدید"}
                  </h3>
                  <div className="text-xs opacity-85 space-y-0.5">
                    <div>مشتری: {p.customerName || "—"}</div>
                    <div>تعمیرکننده: {p.technicianName || "—"}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={p.status} />
                  <SeverityBadge severity={p.severity} />
                  <button
                    type="button"
                    className={
                      "part-table__settle-btn " +
                      (p.settled
                        ? "part-table__settle-btn--on"
                        : "part-table__settle-btn--off")
                    }
                    onClick={() => onToggleSettled(p)}
                  >
                    {p.settled ? "تسویه شد" : "تسویه نشده"}
                  </button>
                </div>
              </div>

              {/* بدنه کارت: سه ستون منطقی */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mt-1">
                {/* ستون ۱: قطعه و توضیحات */}
                <div className="space-y-1">
                  <div>
                    قطعه: <strong>{p.partName || "—"}</strong>
                  </div>
                  {p.serial && (
                    <div>
                      سریال: <span>{p.serial}</span>
                    </div>
                  )}
                  <div className="text-xs md:text-sm">
                    توضیح عیب: {p.faultDesc || "—"}
                  </div>
                  {p.notes && (
                    <div className="text-xs opacity-85">
                      یادداشت: {p.notes}
                    </div>
                  )}
                </div>

                {/* ستون ۲: تاریخ‌ها */}
                <div className="space-y-1 text-xs md:text-sm opacity-85">
                  <div>دریافت: {p.receivedDate || "—"}</div>
                  <div>تکمیل: {p.completedDate || "—"}</div>
                  <div>تحویل: {p.deliveredDate || "—"}</div>
                </div>

                {/* ستون ۳: قیمت‌ها */}
                <div className="space-y-1 text-xs md:text-sm text-right">
                  <div>
                    قیمت تعمیر:{" "}
                    {formatMoney(p.techPrice ?? 0, currency)}
                  </div>
                  <div>
                    قیمت شما:{" "}
                    {formatMoney(p.myPrice ?? 0, currency)}
                  </div>
                  <div>
                    قیمت نهایی:{" "}
                    {formatMoney(p.companyPrice ?? 0, currency)}
                  </div>
                  {p.tags?.length ? (
                    <div className="text-[0.7rem] opacity-80 mt-1">
                      برچسب‌ها: {p.tags.join("، ")}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* فوتر کارت: دکمه‌ها */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[0.7rem] opacity-70">
                  {p.id
                    ? `سفارش #${p.id} — آخرین وضعیت: ${
                        p.status === "pending"
                          ? "در جریان"
                          : p.deliveredDate
                          ? "تحویل شده"
                          : "تعمیر شده"
                      }`
                    : "سفارش جدید"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-tone btn-xs text-xs"
                    onClick={() => onEdit(p)}
                  >
                    ویرایش
                  </button>
                  {p.id && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-xs"
                      onClick={() => {
                        if (
                          window.confirm(
                            `حذف سفارش #${p.id} (${p.partName}) ؟`
                          )
                        ) {
                          onDelete(p.id!);
                        }
                      }}
                    >
                      حذف
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-xs"
                    onClick={() => renderInvoicePDF(p, currency)}
                  >
                    PDF
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrdersPage;
