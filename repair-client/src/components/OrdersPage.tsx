import React from 'react';
import type { Part } from '../types';
import OrdersKanban from './OrdersKanban/OrdersKanban';

type OrdersPageProps = {
  parts: Part[];
  onEdit: (part: Part) => void;
  onDelete: (id: number) => void;
  // هر پروپ اضافه‌ای که از App پاس داده می‌شود را هم قبول می‌کنیم
  [key: string]: any;
};

const OrdersPage: React.FC<OrdersPageProps> = ({ parts, onEdit, onDelete }) => {
  return (
    <div className="orders-page">
      <OrdersKanban parts={parts} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};

export default OrdersPage;
