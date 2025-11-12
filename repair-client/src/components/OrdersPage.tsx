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
      {/* Grid of order cards (tile layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map(order => (
          <div 
            key={order.id} 
            className="card p-4 rounded-xl shadow-md hover:shadow-lg transition-all bg-white dark:bg-gray-800"
          >
            <h3 className="font-bold mb-1">سفارش #{order.id}</h3>
            <p className="mb-1">مشتری: {order.customerName}</p>
            <p className="mb-1">قطعه: {order.partName}</p>
            <p className="mb-1">
              وضعیت:{" "}
              <span className={`chip ${order.status === 'repaired' ? 'chip--mint' : 'chip--violet'}`}>
                {order.status === 'repaired' ? 'تعمیر شده' : 'در جریان'}
              </span>
            </p>
            <p className="mb-1">تاریخ دریافت: {order.receivedDate}</p>
            <p className="mb-2">تاریخ تحویل: {order.deliveredDate ? order.deliveredDate : '—'}</p>
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
