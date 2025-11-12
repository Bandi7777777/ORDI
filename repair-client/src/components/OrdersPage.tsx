import React from 'react';
import type { Part } from '../types';
import { formatJalaliDate } from '../utils/format';

type Props = {
  parts: Part[];
  onEdit: (p: Part) => void;
  onDelete: (id: number) => void;
  emptyMessage?: string;
};

export default function OrdersPage({ parts, onEdit, onDelete, emptyMessage }: Props) {
  return (
    <div className="card p-4">
      <h2 className="text-base font-semibold mb-4">سفارش‌ها</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parts.map(order => (
          <div key={order.id} className="card p-4">
            <h3 className="font-bold">سفارش #{order.id}</h3>
            <p>مشتری: {order.customerName}</p>
            <p>قطعه: {order.partName}</p>
            <p>وضعیت: <span className={`chip ${order.status === 'repaired' ? 'chip--mint' : 'chip--violet'}`}>{order.status === 'repaired' ? 'تعمیر شده' : 'در جریان'}</span></p>
            <p>تاریخ ورود: {formatJalaliDate(order.receivedDate)}</p>
            <div className="flex gap-2 mt-3">
              <button className="btn btn-primary text-xs" onClick={() => onEdit(order)}>ویرایش</button>
              <button className="btn btn-ghost text-xs text-rose-300" onClick={() => order.id && onDelete(order.id)}>حذف</button>
            </div>
          </div>
        ))}
        {parts.length === 0 && emptyMessage && (
          <div className="col-span-full text-center opacity-80 py-6">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  );
}
