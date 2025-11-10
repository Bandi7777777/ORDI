import type { Severity, Status } from "../types";

export function StatusBadge({ status }: { status: Status }) {
  const text = status === "repaired" ? "تعمیر شده" : "در جریان";
  const cls = status === "repaired"
    ? "badge border-emerald-400 bg-[rgba(36,175,120,.16)]"
    : "badge border-[rgba(72,228,255,.5)] bg-[rgba(72,228,255,.12)]";
  return <span className={cls}>{text}</span>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map = {
    normal:  "badge badge-normal",
    urgent:  "badge badge-urgent",
    critical:"badge badge-critical"
  } as const;
  const txt = severity === "normal" ? "عادی" : severity === "urgent" ? "فوری" : "خطرناک";
  return <span className={map[severity]}>اولویت: {txt}</span>;
}
