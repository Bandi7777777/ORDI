// @ts-nocheck
import React, { useEffect } from "react";

type ToastItem = {
  id: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
  duration?: number;
};

type Props = {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
};

const typeColors: Record<
  NonNullable<ToastItem["type"]>,
  { border: string; bg: string; icon: string }
> = {
  info: {
    border: "border-cyan-400/70",
    bg: "bg-cyan-900/70",
    icon: "ℹ️",
  },
  success: {
    border: "border-emerald-400/70",
    bg: "bg-emerald-900/70",
    icon: "✅",
  },
  error: {
    border: "border-rose-400/70",
    bg: "bg-rose-900/70",
    icon: "⛔",
  },
  warning: {
    border: "border-amber-400/80",
    bg: "bg-amber-900/75",
    icon: "⚠️",
  },
};

const ToastPro: React.FC<Props> = ({ toasts, removeToast }) => {
  // Auto-dismiss برای هر toast
  useEffect(() => {
    if (!toasts.length) return;
    const timers: number[] = [];

    toasts.forEach((t) => {
      const ms = t.duration ?? 2200;
      const timer = window.setTimeout(() => {
        removeToast(t.id);
      }, ms);
      timers.push(timer);
    });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [toasts, removeToast]);

  if (!toasts.length) return null;

  return (
    <div
      className="fixed z-50 inset-0 pointer-events-none flex items-start justify-end p-4 md:p-6"
      style={{ direction: "rtl" }}
    >
      <div className="flex flex-col gap-2 max-w-sm w-full md:w-80 pointer-events-auto">
        {toasts.map((t) => {
          const type: NonNullable<ToastItem["type"]> = t.type || "info";
          const colors = typeColors[type];

          return (
            <div
              key={t.id}
              className={`rounded-xl border ${colors.border} ${colors.bg} shadow-lg px-3 py-2 md:px-4 md:py-3 flex items-start gap-2 text-xs md:text-sm text-slate-50`}
            >
              <div className="mt-0.5 md:mt-0">{colors.icon}</div>
              <div className="flex-1">
                <p className="leading-snug">{t.message}</p>
              </div>
              <button
                type="button"
                className="text-slate-200/80 hover:text-white text-xs ml-1"
                onClick={() => removeToast(t.id)}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToastPro;
