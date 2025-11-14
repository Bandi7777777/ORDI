import { useEffect, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import type { Part } from '../types';
import { updatePart } from '../lib/db';
import type { KanbanStatus } from '../components/OrdersKanban/StatusColumn';

type PartWithDelivery = Part & { deliveredDate?: string | null };

type ColumnsMap = Record<KanbanStatus, PartWithDelivery[]>;

function groupParts(parts: PartWithDelivery[]): ColumnsMap {
  const pending: PartWithDelivery[] = [];
  const repaired: PartWithDelivery[] = [];
  const delivered: PartWithDelivery[] = [];

  for (const p of parts) {
    if (p.status === 'pending') {
      pending.push(p);
    } else if (p.status === 'repaired' && p.deliveredDate) {
      delivered.push(p);
    } else if (p.status === 'repaired') {
      repaired.push(p);
    } else {
      // در صورت وضعیت ناشناخته، به ستون در جریان منتقل می‌شود
      pending.push(p);
    }
  }

  return {
    pending,
    repaired,
    delivered,
  };
}

export function useOrderBoard(parts: Part[]): {
  columns: ColumnsMap;
  handleDragEnd: (event: DragEndEvent) => void;
} {
  const [columns, setColumns] = useState<ColumnsMap>(() =>
    groupParts(parts as PartWithDelivery[])
  );

  // همگام‌سازی با لیست فیلترشده/به‌روزشده از والد
  useEffect(() => {
    setColumns(groupParts(parts as PartWithDelivery[]));
  }, [parts]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeData = active.data.current as { id?: number } | null;
    const orderId = activeData?.id;
    const targetColumn = over.id as KanbanStatus | undefined;

    if (!orderId || !targetColumn) return;

    setColumns((prev) => {
      const next: ColumnsMap = {
        pending: [...prev.pending],
        repaired: [...prev.repaired],
        delivered: [...prev.delivered],
      };

      let moved: PartWithDelivery | undefined;
      let fromColumn: KanbanStatus | null = null;

      (['pending', 'repaired', 'delivered'] as KanbanStatus[]).forEach(
        (col) => {
          if (fromColumn !== null) return;
          const idx = next[col].findIndex((p) => p.id === orderId);
          if (idx !== -1) {
            moved = { ...next[col][idx] };
            next[col].splice(idx, 1);
            fromColumn = col;
          }
        }
      );

      if (!moved) return prev;

      // اگر ستون مبدا و مقصد یکی باشد، نیازی به آپدیت نیست
      if (fromColumn === targetColumn) {
        return prev;
      }

      // منطق تغییر وضعیت:
      // - pending => repaired : فقط status = 'repaired'
      // - هرکجا => pending     : status = 'pending' + پاک کردن deliveredDate
      // - به delivered         : status = 'repaired' + set deliveredDate
      if (targetColumn === 'pending') {
        moved.status = 'pending' as Part['status'];
        moved.deliveredDate = undefined;
      } else if (targetColumn === 'repaired') {
        moved.status = 'repaired' as Part['status'];
        moved.deliveredDate = undefined;
      } else if (targetColumn === 'delivered') {
        moved.status = 'repaired' as Part['status'];
        moved.deliveredDate = new Date().toISOString();
      }

      next[targetColumn].push(moved);

      return next;
    });

    // به‌روزرسانی Dexie
    try {
      if (targetColumn === 'pending') {
        await updatePart(orderId, {
          status: 'pending' as Part['status'],
          deliveredDate: undefined,
        } as Partial<PartWithDelivery>);
      } else if (targetColumn === 'repaired') {
        await updatePart(orderId, {
          status: 'repaired' as Part['status'],
          deliveredDate: undefined,
        } as Partial<PartWithDelivery>);
      } else if (targetColumn === 'delivered') {
        await updatePart(orderId, {
          status: 'repaired' as Part['status'],
          deliveredDate: new Date().toISOString(),
        } as Partial<PartWithDelivery>);
      }
    } catch (error) {
      console.error('Failed to update part status', error);
    }
  };

  return { columns, handleDragEnd };
}
