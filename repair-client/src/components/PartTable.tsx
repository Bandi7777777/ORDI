// @ts-nocheck
import React from "react";
import type { Part, Currency } from "../types";
import { formatMoney } from "../utils/format";
import { renderInvoicePDF } from "../utils/invoice";
import { StatusBadge, SeverityBadge } from "./StatusBadge";

type Props = {
  parts: Part[];
  currency: Currency;
  onEdit: (p: Part) => void;
  onDelete: (id: number) => void;
  onToggleSettled: (p: Part) => void;
  onBulkDelete: (ids: number[]) => void;
  onBulkSettle: (ids: number[], settled: boolean) => void;
};

const PartTable: React.FC<Props> = ({
  parts,
  currency,
  onEdit,
  onDelete,
  onToggleSettled,
  onBulkDelete,
  onBulkSettle,
}) => {
  const [selected, setSelected] = React.useState<number[]>([]);

  const selectableIds = React.useMemo(
    () => parts.filter((p) => p.id != null).map((p) => p.id!) as number[],
    [parts]
  );
  const allSelected =
    selectableIds.length > 0 && selected.length === selectableIds.length;

  const toggleSelectOne = (id?: number | null) => {
    if (!id) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(allSelected ? [] : selectableIds);
  };

  const handleBulkSettle = (settled: boolean) => {
    if (!selected.length) return;
    onBulkSettle(selected, settled);
    setSelected([]);
  };

  const handleBulkDelete = () => {
    if (!selected.length) return;
    if (!window.confirm("حذف گروهی رکوردهای انتخاب‌شده؟")) return;
    onBulkDelete(selected);
    setSelected([]);
  };

  const hasRows = parts.length > 0;

  const renderSettledChip = (part: Part) => {
    const settled = part.settled;
    return (
      <button
        type="button"
        className={
          "part-table__settle-btn " +
          (settled
            ? "part-table__settle-btn--on"
            : "part-table__settle-btn--off")
        }
        onClick={() => onToggleSettled(part)}
      >
        {settled ? "تسویه شد" : "تسویه نشده"}
      </button>
    );
  };

  return (
    <section className="card part-table">
      <header className="part-table__header">
        <div className="part-table__title-block">
          <h3 className="part-table__title">لیست قطعات ثبت‌شده</h3>
          <p className="part-table__subtitle">
            در این بخش، همه‌ی سفارش‌ها را به‌صورت کارت‌های مرتب می‌بینید؛
            وضعیت، تسویه و اولویت را از همین‌جا مدیریت کنید.
          </p>
        </div>

        {selected.length > 0 && (
          <div className="part-table__bulk">
            <span className="part-table__bulk-label">
              {selected.length} مورد انتخاب شده
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={toggleSelectAll}
            >
              {allSelected ? "لغو انتخاب همه" : "انتخاب همه"}
            </button>
            <button
              type="button"
              className="btn btn-tone btn-xs"
              onClick={() => handleBulkSettle(true)}
            >
              تسویه گروهی
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => handleBulkSettle(false)}
            >
              علامت‌گذاری تسویه‌نشده
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs part-table__bulk-delete"
              onClick={handleBulkDelete}
            >
              حذف گروهی
            </button>
          </div>
        )}
      </header>

      {!hasRows ? (
        <div className="part-table__empty">
          هنوز رکوردی ثبت نشده — از «ثبت قطعه جدید» شروع کنید.
        </div>
      ) : (
        <div className="space-y-3 mt-2">
          {parts.map((part) => {
            const id = part.id ?? 0;
            const isSelected = selected.includes(id);

            return (
              <article
                key={id || `${part.customerName}-${part.partName}`}
                className={`card p-3 md:p-4 flex flex-col gap-2 ${
                  isSelected ? "border-cyan-500/70" : ""
                }`}
              >
                {/* ردیف بالا: انتخاب + وضعیت + شماره */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {part.id && (
                      <input
                        type="checkbox"
                        className="scale-110"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(part.id)}
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs opacity-70">
                        سفارش #{part.id ?? "جدید"}
                      </span>
                      <span className="text-sm font-semibold">
                        {part.partName || "قطعه بدون نام"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={part.status} />
                    <SeverityBadge severity={part.severity} />
                    {renderSettledChip(part)}
                  </div>
                </div>

                {/* ردیف دوم: مشتری / تعمیرکننده / توضیح */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs md:text-sm mt-1">
                  <div className="space-y-1">
                    <div>
                      مشتری:{" "}
                      <span className="opacity-90">
                        {part.customerName || "—"}
                      </span>
                    </div>
                    <div>
                      تعمیرکننده:{" "}
                      <span className="opacity-90">
                        {part.technicianName || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="line-clamp-2">
                      توضیح عیب: {part.faultDesc || "—"}
                    </div>
                  </div>
                </div>

                {/* ردیف سوم: تاریخ‌ها و مبلغ‌ها */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[0.75rem] md:text-xs mt-1 opacity-80">
                  <div className="space-y-1">
                    <div>دریافت: {part.receivedDate || "—"}</div>
                    <div>تکمیل: {part.completedDate || "—"}</div>
                    <div>تحویل: {part.deliveredDate || "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <div>
                      قیمت تعمیر:{" "}
                      {formatMoney(part.techPrice ?? 0, currency)}
                    </div>
                    <div>
                      قیمت شما:{" "}
                      {formatMoney(part.myPrice ?? 0, currency)}
                    </div>
                    <div>
                      قیمت نهایی:{" "}
                      {formatMoney(part.companyPrice ?? 0, currency)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {part.tags?.length ? (
                      <div>برچسب‌ها: {part.tags.join("، ")}</div>
                    ) : (
                      <div className="opacity-60">بدون برچسب</div>
                    )}
                    {part.notes && (
                      <div className="line-clamp-2">
                        یادداشت: {part.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* ردیف آخر: دکمه‌ها */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[0.7rem] opacity-70">
                    {part.id
                      ? `آخرین وضعیت سفارش #${part.id}`
                      : "سفارش ثبت نشده"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-tone btn-xs"
                      onClick={() => onEdit(part)}
                    >
                      ویرایش
                    </button>
                    {part.id && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          if (
                            window.confirm(
                              `حذف سفارش #${part.id} (${part.partName}) ؟`
                            )
                          ) {
                            onDelete(part.id!);
                          }
                        }}
                      >
                        حذف
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => renderInvoicePDF(part, currency)}
                    >
                      PDF
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PartTable;
