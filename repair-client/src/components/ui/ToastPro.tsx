import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export type ToastItem = {
  id: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
  duration?: number; // ms
};

type Props = {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
};

/* ریشه‌ی پایدار برای همه‌ی توست‌ها */
function getToastRoot(): HTMLElement {
  let el = document.getElementById("__toast_portal_root");
  if (!el) {
    el = document.createElement("div");
    el.id = "__toast_portal_root";
    el.style.position = "relative";
    el.style.zIndex = "1100";
    document.body.appendChild(el);
  }
  return el;
}

/* یک Toast واحد با تایمر امن */
function ToastRow({ t, onClose }: { t: ToastItem; onClose: (id: string) => void }) {
  useEffect(() => {
    const ms = t.duration ?? 2200;
    const timer = setTimeout(() => onClose(t.id), ms);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, onClose]);

  const tone =
    t.type === "success" ? "var(--c-mint)" :
    t.type === "error"   ? "var(--c-pink)" :
    t.type === "warning" ? "var(--c-violet)" :
                           "var(--c-cyan)";

  return (
    <div
      dir="rtl"
      className="toast-item animate-slideIn"
      style={{
        minWidth: 260, maxWidth: 420, padding: "10px 14px", borderRadius: 12,
        background: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))",
        border: "1px solid var(--color-border, rgba(210,225,255,.14))",
        color: "var(--fg-1)", boxShadow: "var(--shadow-md, 0 22px 70px rgba(3,10,24,.45))",
        backdropFilter: "blur(10px)", display: "flex", gap: 8, alignItems: "flex-start",
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: tone, marginTop: 8 }} />
      <div style={{ lineHeight: 1.6, flex: 1 }}>{t.message}</div>
      <button
        onClick={() => onClose(t.id)}
        className="btn btn-ghost text-xs"
        style={{ padding: "2px 6px", borderRadius: 8 }}
        aria-label="بستن"
      >
        بستن
      </button>
    </div>
  );
}

export default function ToastPro({ toasts, removeToast }: Props) {
  const root = getToastRoot(); // پایدار

  const node = (
    <div
      className="toast-root"
      style={{
        position: "fixed", right: 16, bottom: 16, display: "grid", gap: 10,
        alignContent: "end", justifyItems: "end", pointerEvents: "none"
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <ToastRow t={t} onClose={removeToast} />
        </div>
      ))}
    </div>
  );

  return createPortal(node, root);
}
