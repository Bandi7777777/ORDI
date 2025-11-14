import React from 'react';
import { DndContext, DragEndEvent, rectIntersection } from '@dnd-kit/core';
import type { Part } from '../../types';
import { useOrderBoard } from '../../hooks/useOrderBoard';
import StatusColumn from './StatusColumn';

type OrdersKanbanProps = {
  parts: Part[];
  onEdit: (part: Part) => void;
  onDelete: (id: number) => void;
};

const OrdersKanban: React.FC<OrdersKanbanProps> = ({ parts, onEdit, onDelete }) => {
  const { columns, handleDragEnd } = useOrderBoard(parts);

  const onDragEnd = (event: DragEndEvent) => {
    handleDragEnd(event);
  };

  return (
    <div className="orders-kanban">
      <DndContext collisionDetection={rectIntersection} onDragEnd={onDragEnd}>
        <div className="orders-kanban__columns">
          <StatusColumn
            status="pending"
            title="در جریان"
            orders={columns.pending}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          <StatusColumn
            status="repaired"
            title="تعمیر شده"
            orders={columns.repaired}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          <StatusColumn
            status="delivered"
            title="تحویل شده"
            orders={columns.delivered}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </DndContext>
    </div>
  );
};

export default OrdersKanban;
