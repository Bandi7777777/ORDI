import React from 'react';
import type { Part } from '../types';

type Props = {
  parts: Part[];
  currency: string;
  onEdit: (p: Part) => void;
  onDelete: (id: number) => void;
  onToggleSettled: (p: Part) => void;
  onBulkDelete: (ids: number[]) => void;
  onBulkSettle: (ids: number[], settled: boolean) => void;
};

export default function PartTable({
  parts,
  currency,
  onEdit,
  onDelete,
  onToggleSettled,
  onBulkDelete,
  onBulkSettle,
}: Props) {
  const [selected, setSelected] = React.useState<number[]>([]);

  const selectableIds = React.useMemo(
    () => parts.filter((p) => p.id != null).map((p) => p.id!) as number[],
    [parts]
  );

  const allSelected =
    selectableIds.length > 0 &&
    selected.length === selectableIds.length;

  const toggleSelectOne = (id?: number | null) => {
    if (!id) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(selectableIds);
    }
  };

  const handleBulkSettle = (settled: boolean) => {
    if (!selected.length) return;
    onBulkSettle(selected, settled);
    setSelected([]);
  };

  const handleBulkDelete = () => {
    if (!selected.length) return;
    if (!window.confirm('حذف گروهی رکوردهای انتخاب‌شده؟')) return;
    onBulkDelete(selected);
    setSelected([]);
  };

  const renderStatusChip = (status: Part['status']) => {
    const label =
      status === 'repaired'
        ? 'تعمیر شده'
        : 'در جریان';
    const cls =
      status === 'repaired'
        ? 'chip chip--mint'
        : 'chip chip--violet';
    return <span className={cls}>{label}</span>;
  };

  const renderSeverityBadge = (severity: Part['severity']) => {
    switch (severity) {
      case 'urgent':
        return <span className="badge badge-urgent">فوری</span>;
      case 'critical':
        return <span className="badge badge-critical">بحرانی</span>;
      default:
        return <span className="badge badge-normal">عادی</span>;
    }
  };

  const renderSettledChip = (part: Part) => {
    const settled = part.settled;
    return (
      <button
        type="button"
        className={
          'part-table__settle-btn ' +
          (settled ? 'part-table__settle-btn--on' : 'part-table__settle-btn--off')
        }
        onClick={() => onToggleSettled(part)}
      >
        {settled ? 'تسویه شد' : 'تسویه نشده'}
      </button>
    );
  };

  const formatMoney = (value?: number | null) => {
    if (!value || !Number.isFinite(value)) return '—';
    return `${value.toLocaleString('fa-IR')} ${currency}`;
  };

  const hasRows = parts.length > 0;

  return (
    <section className="card part-table">
      <header className="part-table__header">
        <div className="part-table__title-block">
          <h3 className="part-table__title">لیست قطعات ثبت‌شده</h3>
          <p className="part-table__subtitle">
            در این جدول می‌توانید وضعیت نهایی، تسویه، اولویت و عملیات هر سفارش را
            مدیریت کنید.
          </p>
        </div>

        {selected.length > 0 && (
          <div className="part-table__bulk">
            <span className="part-table__bulk-label">
              {selected.length} مورد انتخاب شده
            </span>
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
              علامت‌گذاری به‌عنوان تسویه نشده
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
        <div className="part-table__scroll">
          <table className="table part-table__table">
            <thead>
              <tr>
                <th style={{ width: '42px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th style={{ width: '40px' }}>#</th>
                <th>زمان‌ها</th>
                <th>قطعه / مشتری</th>
                <th>تعمیرکننده</th>
                <th>توضیح</th>
                <th>قیمت تعمیر</th>
                <th>قیمت من</th>
                <th>قیمت نهایی</th>
                <th>وضعیت</th>
                <th>تسویه</th>
                <th>اولویت</th>
                <th>PDF / عملیات</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => {
                const id = part.id ?? 0;
                const isSelected = selected.includes(id);

                return (
                  <tr key={id || `${part.customerName}-${part.partName}`}>
                    <td>
                      {part.id && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(part.id)}
                        />
                      )}
                    </td>
                    <td>{part.id}</td>
                    <td className="cell-2line part-table__dates">
                      <span>دریافت: {part.receivedDate || '—'}</span>
                      <span>تکمیل: {part.completedDate || '—'}</span>
                      <span>تحویل: {part.deliveredDate || '—'}</span>
                    </td>
                    <td className="cell-2line">
                      <strong>{part.partName}</strong>
                      <span className="part-table__sub">
                        مشتری: {part.customerName || '—'}
                      </span>
                    </td>
                    <td className="cell-ellipsis">
                      {part.technicianName || '—'}
                    </td>
                    <td className="cell-2line">
                      {part.faultDesc || '—'}
                    </td>
                    <td>{formatMoney(part.repairPrice)}</td>
                    <td>{formatMoney(part.myPrice)}</td>
                    <td>{formatMoney(part.finalPrice)}</td>
                    <td>{renderStatusChip(part.status)}</td>
                    <td>{renderSettledChip(part)}</td>
                    <td>{renderSeverityBadge(part.severity)}</td>
                    <td className="part-table__actions">
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
                          onClick={() => onDelete(part.id!)}
                        >
                          حذف
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        disabled
                        title="صدور PDF (به‌زودی)"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
