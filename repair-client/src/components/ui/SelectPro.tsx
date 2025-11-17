// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = {
  label: string;
  value: string;
  icon?: JSX.Element;
  group?: string;
};

type Props = {
  value?: string | string[];
  multiple?: boolean;
  onChange: (v: any) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  searchable?: boolean;
};

const SelectPro: React.FC<Props> = ({
  value,
  multiple = false,
  onChange,
  options,
  placeholder = "انتخاب…",
  className = "",
  ariaLabel,
  searchable = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value]
  );

  const selLabel = useMemo(() => {
    if (multiple) {
      return selected.length ? `${selected.length} مورد انتخاب شده` : placeholder;
    }
    const s = options.find((o) => o.value === value)?.label;
    return s || placeholder;
  }, [value, multiple, options, placeholder, selected.length]);

  const filtered = useMemo(() => {
    const fq = q.trim().toLowerCase();
    if (!fq) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(fq) ||
        o.value.toLowerCase().includes(fq)
    );
  }, [q, options]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!containerRef.current) return;
      if (!containerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  function toggleValue(v: string) {
    if (multiple) {
      const arr = selected as string[];
      const next = arr.includes(v)
        ? arr.filter((x) => x !== v)
        : [...arr, v];
      onChange(next);
    } else {
      onChange(v);
      setOpen(false);
    }
    setQ("");
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ direction: "rtl" }}
    >
      <button
        type="button"
        className="input px-4 py-3 w-full flex items-center justify-between text-sm md:text-base font-medium rounded-xl shadow-sm hover:shadow-md border border-gray-300/60 dark:border-gray-600/70 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-300/40 dark:focus:ring-cyan-800/60 transition-all duration-200 bg-white/60 dark:bg-black/40 text-gray-900 dark:text-gray-100"
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{selLabel}</span>
        <svg
          className={`w-4 h-4 md:w-5 md:h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M19 9l-7 7-7-7"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white/10 dark:bg-black/85 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/40 dark:border-gray-700/50 overflow-hidden">
          {searchable && (
            <input
              className="w-full px-4 py-2.5 text-sm md:text-base border-b border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:border-cyan-500 transition-colors duration-150 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="جستجو..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          )}
          <div className="max-h-72 overflow-y-auto px-2 py-1">
            <ul className="space-y-1">
              {filtered.map((o) => {
                const active = (selected as string[]).includes(o.value);
                return (
                  <li
                    key={o.value}
                    role="option"
                    aria-selected={active}
                    onClick={() => toggleValue(o.value)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm md:text-base rounded-xl transition-all duration-150 ${
                      active
                        ? "bg-cyan-50/70 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-200"
                        : "hover:bg-gray-100/70 dark:hover:bg-gray-800/60 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {multiple && (
                      <input
                        type="checkbox"
                        readOnly
                        checked={active}
                        className="accent-cyan-500 rounded border-gray-300 dark:border-gray-600"
                      />
                    )}
                    {o.icon && (
                      <span className="text-gray-500 dark:text-gray-300">
                        {o.icon}
                      </span>
                    )}
                    <span className="flex-1 truncate">{o.label}</span>
                  </li>
                );
              })}
              {!filtered.length && (
                <li className="text-xs text-center opacity-60 py-3">
                  نتیجه‌ای یافت نشد
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectPro;
