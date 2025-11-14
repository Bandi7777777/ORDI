import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Part } from '../../types';
import OrderCard from './OrderCard';

export type KanbanStatus = 'pending' | 'repaired' | 'delivered';

type StatusColumnProps = {
  status: KanbanStatus;
  title: string;
  orders: Part[];
  onEdit: (part: Part) => void;
  onDelete: (id: number) => void;
};

const StatusColumn: React.FC<StatusColumnProps> = ({
  status,
  title,
  orders,
  onEdit,
  onDelete,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="orders-kanban__column">
      <div className="orders-kanban__column-header">
        <h3 className="orders-kanban__column-title">{title}</h3>
        <span className="orders-kanban__column-count">{orders.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={
          'orders-kanban__items' +
          (isOver ? ' orders-kanban__items--over' : '')
        }
      >
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {orders.length === 0 && (
          <div className="orders-kanban__empty">
            فعلاً سفارشی در این ستون نیست
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusColumn;
