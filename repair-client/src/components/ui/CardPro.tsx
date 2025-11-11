import React from "react";

type Props = {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function CardPro({ title, children, footer, className = "" }: Props) {
  const base =
    "bg-[var(--color-surface-dark)] p-[var(--spacing-md)] rounded-[var(--radius-lg)] " +
    "shadow-[var(--shadow-md)] border border-[var(--color-border)] transition-shadow hover:shadow-[var(--shadow-lg)]";
  return (
    <div className={`${base} ${className}`}>
      {title && (
        <h3 className="text-[var(--font-lg)] font-semibold mb-[var(--spacing-sm)] text-[var(--fg-1)]">
          {title}
        </h3>
      )}
      <div className="text-[var(--font-base)] space-y-[var(--spacing-sm)]">
        {children}
      </div>
      {footer && (
        <div className="mt-[var(--spacing-md)] pt-[var(--spacing-sm)] border-t border-[var(--color-border)]">
          {footer}
        </div>
      )}
    </div>
  );
}
