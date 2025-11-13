import React from 'react';
import type { Part } from '../types';
import { StatusBadge, SeverityBadge } from './StatusBadge';

type Props = {
  parts: Part[];
  onEdit: (p: Part) => void;
  onDelete: (id: number) => void;
  emptyMessage?: string;
  currency?: string;
};

export default function OrdersPage({ parts, onEdit, onDelete, emptyMessage, currency = 'تومان' }: Props) {
  return (
    <div className="card p-4"> 
      <h2 className="text-base font-semibold mb-4">سفارش‌ها</h2>

      {/* چیدمان کارت‌ها در یک گرید responsvie دو ستونه (در موبایل تک‌ستونه، دسکتاپ سه‌ستونه) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parts.map(order => (
          <div 
            key={order.id} 
            className="card p-4 flex flex-col justify-between backdrop-blur-sm"
          >
            {/* بخش اطلاعات سفارش */}
            <div>
              <h3 className="font-bold text-lg mb-2">سفارش #{order.id}</h3>
              <p className="mb-1">مشتری: <span className="opacity-90">{order.customerName}</span></p>
              <p className="mb-1">قطعه: <span className="opacity-90">{order.partName}</span></p>
              <p className="mb-1">
                وضعیت: <StatusBadge status={order.status} />
              </p>
              <p className="mb-1">
                <SeverityBadge severity={order.severity} />
              </p>
              <p className="mb-1">تاریخ دریافت: {order.receivedDate}</p>
              <p className="mb-1">تاریخ تحویل: {order.deliveredDate ? order.deliveredDate : '—'}</p>
              <p className="mt-2 font-semibold">
                قیمت کل: {order.companyPrice} <span className="text-sm">{currency}</span>
              </p>
            </div>

            {/* دکمه‌های عملیات و ویرایش/حذف */}
            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary text-xs" onClick={() => onEdit(order)}>ویرایش</button>
              <button className="btn btn-ghost text-xs" onClick={() => order.id && onDelete(order.id)}>حذف</button>
            </div>
          </div>
        ))}

        {/* حالت عدم وجود سفارش */}
        {parts.length === 0 && (
          <div className="col-span-full text-center text-sm opacity-80 py-8">
            {emptyMessage ? emptyMessage : 'هنوز هیچ سفارشی ثبت نشده است. 🙂'}
          </div>
        )}
      </div>
    </div>
  );
}
