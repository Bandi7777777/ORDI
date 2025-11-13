import React, { useState } from 'react';
import type { Part } from '../types';

type Props = {
  parts: Part[];
  onEdit: (p: Part) => void;
  onDelete: (id: number) => void;
};

export default function OrdersPage({ parts, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');

  // Filter orders by customer name or order ID (numeric)
  const filteredOrders = parts.filter(order =>
    order.customerName.toLowerCase().includes(search.toLowerCase()) ||
    (order.id && order.id.toString().includes(search))
  );

  // Icons for status and dates
  const IcCheck = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20 6 L9 17 L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  const IcClock = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  const IcCalendar = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="card p-4">
      <h2 className="text-base font-semibold mb-4">سفارش‌ها</h2>
      {/* Search input for customer name or order number */}
      <input
        className="input mb-4 w-full"
        placeholder="جستجو نام مشتری یا شماره سفارش..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {/* Grid of order cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="card p-4 transition-shadow hover:shadow-lg">
            <h3 className="font-bold mb-2">سفارش #{order.id}</h3>
            <p className="mb-1">مشتری: {order.customerName}</p>
            <p className="mb-1">قطعه: {order.partName}</p>
            <p className="mb-1">
              وضعیت:{" "}
              <span className={`chip ${order.status === 'repaired' ? 'chip--mint' : 'chip--violet'}`}>
                {order.status === 'repaired' ? IcCheck : IcClock}{" "}
                {order.status === 'repaired' ? 'تعمیر شده' : 'در جریان'}
              </span>
              <span className="mx-2 opacity-75">|</span>
              اولویت:{" "}
              <span className={`badge inline-flex items-center gap-1 rounded-full ${
                order.severity === 'normal'
                  ? 'border-gray-400/50 bg-gray-200/10 dark:border-gray-600/50 dark:bg-gray-700/20'
                  : order.severity === 'urgent'
                  ? 'border-amber-400 bg-amber-400/10 dark:bg-amber-400/20'
                  : 'border-[rgba(255,121,198,0.5)] bg-[rgba(255,121,198,0.12)]'
              }`}>
                {order.severity === 'normal' ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5 12h14" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ) : order.severity === 'urgent' ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}{" "}
                {order.severity === 'normal' ? 'عادی' : order.severity === 'urgent' ? 'فوری' : 'بحرانی'}
              </span>
            </p>
            <p className="mb-1">
              {IcCalendar}{" "}
              تاریخ دریافت: {order.receivedDate}
            </p>
            <p className="mb-2">
              {IcCalendar}{" "}
              تاریخ تحویل: {order.deliveredDate ? order.deliveredDate : '—'}
            </p>
            <div className="flex gap-2">
              <button className="btn btn-primary text-xs" onClick={() => onEdit(order)}>ویرایش</button>
              <button className="btn btn-ghost text-xs" onClick={() => order.id && onDelete(order.id)}>حذف</button>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <p className="text-center text-gray-500">هیچ سفارشی یافت نشد.</p>
        )}
      </div>
    </div>
  );
}
