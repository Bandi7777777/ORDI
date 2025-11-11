import React, { useState } from 'react';
import type { Part } from '../types'; // فرض بر import

type Props = {
  parts: Part[]; // از App.tsx بگیرید
  onEdit: (p: Part) => void;
  onDelete: (id: number) => void;
};

export default function OrdersPage({ parts, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');

  const filteredOrders = parts.filter((part) => 
    part.customerName.toLowerCase().includes(search.toLowerCase()) || part.id?.toString().includes(search)
  );

  return (
    <div className="card p-4">
      <h2 className="text-base font-semibold mb-4">سفارش‌ها</h2>
      <input 
        className="input mb-4 w-full"
        placeholder="جستجو نام مشتری یا شماره سفارش..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="card p-4 rounded-xl shadow-md hover:shadow-lg transition-all bg-white dark:bg-gray-800">
            <h3 className="font-bold">سفارش #{order.id}</h3>
            <p>مشتری: {order.customerName}</p>
            <p>قطعه: {order.partName}</p>
            <p>وضعیت: <span className={`chip ${order.status === 'repaired' ? 'chip--mint' : 'chip--violet'}`}>{order.status}</span></p>
            <p>تاریخ ورود: {order.receivedDate}</p>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-primary text-xs" onClick={() => onEdit(order)}>ویرایش</button>
              <button className="btn btn-ghost text-xs" onClick={() => onDelete(order.id!)}>حذف</button>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && <p className="text-center text-gray-500">هیچ سفارشی یافت نشد.</p>}
      </div>
    </div>
  );
};