import { formatMoney } from "../utils/format";
import type { Currency } from "../types";

export function PriceBadge({ label, value, currency }: { label: string; value: number; currency: Currency }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/40 bg-white/10 px-3 py-1 text-xs card">
      <span className="opacity-75">{label}:</span>
      <span className="font-semibold">{formatMoney(value, currency)}</span>
    </div>
  );
}
