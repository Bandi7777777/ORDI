import React from 'react';
import type { Part } from '../types'; // فرض بر import type

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
  // منطق انتخاب‌ها (فرض بر state برای انتخاب‌ها)
  const [selected, setSelected] = React.useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const bulkActions = selected.length > 0 && (
    <div className="flex gap-2 mb-4">
      <button className="btn btn-primary text-xs" onClick={() => onBulkSettle(selected, true)}>تسویه گروهی</button>
      <button className="btn btn-primary text-xs" onClick={() => onBulkSettle(selected, false)}>تسویه‌نشده گروهی</button>
      <button className="btn btn-ghost text-xs" onClick={() => onBulkDelete(selected)}>حذف گروهی</button>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800">
      {bulkActions}
      <table className="w-full border-collapse text-right text-gray-900 dark:text-gray-100 min-w-[1200px]">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-sm font-bold">
            <th className="p-3 border-b rounded-tl-xl">انتخاب</th>
            <th className="p-3 border-b">#</th>
            <th className="p-3 border-b">زمان‌ها</th>
            <th className="p-3 border-b">قطعه</th>
            <th className="p-3 border-b">مشتری</th>
            <th className="p-3 border-b">تعمیرکننده</th>
            <th className="p-3 border-b">توضیح</th>
            <th className="p-3 border-b">قیمت تعمیر</th>
            <th className="p-3 border-b">قیمت من</th>
            <th className="p-3 border-b">قیمت نهایی</th>
            <th className="p-3 border-b">وضعیت</th>
            <th className="p-3 border-b">تسویه</th>
            <th className="p-3 border-b">اولویت</th>
            <th className="p-3 border-b rounded-tr-xl">PDF / عملیات</th>
          </tr>
        </thead>
        <tbody>
          {parts.length === 0 ? (
            <tr>
              <td colSpan={14} className="p-4 text-center text-gray-500 dark:text-gray-400">
                هنوز رکوردی ثبت نشده — از «ثبت قطعه جدید» شروع کنید.
              </td>
            </tr>
          ) : (
            parts.map((part) => (
              <tr key={part.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                <td className="p-3 border-b">
                  <input type="checkbox" checked={selected.includes(part.id!)} onChange={() => toggleSelect(part.id!)} />
                </td>
                <td className="p-3 border-b">{part.id}</td>
                <td className="p-3 border-b">{part.receivedDate} - {part.completedDate || '-'}</td>
                <td className="p-3 border-b">{part.partName}</td>
                <td className="p-3 border-b">{part.customerName}</td>
                <td className="p-3 border-b">{part.technicianName}</td>
                <td className="p-3 border-b cell-ellipsis">{part.faultDesc}</td>
                <td className="p-3 border-b">{part.repairPrice} {currency}</td>
                <td className="p-3 border-b">{part.myPrice} {currency}</td>
                <td className="p-3 border-b">{part.finalPrice} {currency}</td>
                <td className="p-3 border-b">{part.status}</td>
                <td className="p-3 border-b">
                  <button onClick={() => onToggleSettled(part)}>{part.settled ? 'تسویه شد' : 'تسویه نشده'}</button>
                </td>
                <td className="p-3 border-b">{part.severity}</td>
                <td className="p-3 border-b flex gap-2">
                  <button className="btn btn-primary text-xs" onClick={() => onEdit(part)}>ویرایش</button>
                  <button className="btn btn-ghost text-xs" onClick={() => onDelete(part.id!)}>حذف</button>
                  <button className="btn btn-tone text-xs">PDF</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};