import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Part } from '../../types';

type OrderCardProps = {
  order: Part;
  onEdit: (part: Part) => void;
  onDelete: (id: number) => void;
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: (order.id ?? `${order.customerName}-${order.partName}`).toString(),
      data: {
        id: order.id,
      },
    });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const statusText =
    order.status === 'repaired'
      ? 'تعمیر شده'
      : 'در جریان';

  const statusClass =
    order.status === 'repaired'
      ? 'chip chip--mint'
      : 'chip chip--violet';

  const severityMap = {
    normal: {
      text: 'عادی',
      className: 'badge badge-normal',
    },
    urgent: {
      text: 'فوری',
      className: 'badge badge-urgent',
    },
    critical: {
      text: 'بحرانی',
      className: 'badge badge-critical',
    },
  } as const;

  const severity = severityMap[order.severity];

  const companyPrice = Number.isFinite(order.companyPrice)
    ? order.companyPrice
    : 0;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="order-card"
    >
      {/* لایه نور نئونی ملایم */}
      <div className="order-card__accent" />

      <header className="order-card__header">
        <div className="order-card__title-block">
          <h4 className="order-card__title">
            {order.partName || 'قطعه بدون نام'}
          </h4>
          <span className="order-card__subtitle">
            {order.customerName
              ? `مشتری: ${order.customerName}`
              : 'مشتری نامشخص'}
          </span>
        </div>

        <div className="order-card__tags">
          <span className={statusClass}>{statusText}</span>
          <span className={severity.className}>{severity.text}</span>
        </div>
      </header>

      <div className="order-card__body">
        <div className="order-card__row order-card__row--dates">
          <span className="order-card__date">
            دریافت: {order.receivedDate || '—'}
          </span>
          <span className="order-card__date">
            تکمیل: {order.completedDate || '—'}
          </span>
          <span className="order-card__date">
            تحویل: {order.deliveredDate || '—'}
          </span>
        </div>

        <div className="order-card__row order-card__row--price">
          <span className="order-card__label">قیمت نهایی:</span>
          <span className="order-card__value">
            {companyPrice.toLocaleString('fa-IR')}
            <span className="order-card__currency"> تومان</span>
          </span>
        </div>
      </div>

      <footer className="order-card__footer">
        <button
          type="button"
          className="btn btn-tone btn-xs"
          onClick={() => onEdit(order)}
        >
          ویرایش
        </button>
        {order.id && (
          <button
            type="button"
            className="btn btn-ghost btn-xs order-card__delete"
            onClick={() => onDelete(order.id!)}
          >
            حذف
          </button>
        )}
      </footer>
    </article>
  );
};

export default OrderCard;
