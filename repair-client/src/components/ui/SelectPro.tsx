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
  searchable?: boolean; // default: false
};

export default function SelectPro({
  value,
  multiple = false,
  onChange,
  options,
  placeholder = "انتخاب…",
  className = "",
  ariaLabel,
  searchable = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value]
  );

  // بسته شدن روی کلیک بیرون
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!containerRef.current) return;

      if (!containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const selLabel = useMemo(() => {
    if (multiple) {
      return selected.length ? `${selected.length} انتخاب شده` : placeholder;
    }
    const s = options.find((o) => o.value === value)?.label;
    return s || placeholder;
  }, [value, multiple, options, placeholder, selected.length]);

  const filtered = useMemo(() => {
    const fq = q.toLowerCase();
    return fq
      ? options.filter(
          (o) =>
            o.label.toLowerCase().includes(fq) ||
            o.value.toLowerCase().includes(fq)
        )
      : options;
  }, [q, options]);

  function toggle(v: string) {
    if (multiple) {
      const arr = selected as string[];
      const newValues = arr.includes(v)
        ? arr.filter((x) => x !== v)
        : [...arr, v];
      onChange(newValues);
    } else {
      onChange(v);
      setOpen(false);
    }
    setQ("");
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ direction: "rtl" }}
    >
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="input px-4 py-3 w-full flex items-center justify-between text-base font-medium rounded-xl shadow-sm hover:shadow-md border border-gray-300 dark:border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-800 transition-all duration-300 bg-white/60 dark:bg-black/40 text-gray-900 dark:text-gray-100"
        aria-label={ariaLabel}
      >
        <span className="truncate">{selLabel}</span>
        <svg
          className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-40 mt-2 w-full select-portal bg-white/10 dark:bg-black/80 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transition-all duration-300 ease-out"
        >
          {searchable && (
            <input
              className="w-full px-4 py-3 text-base border-b border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:border-cyan-500 transition-colors duration-200 placeholder-gray-500 dark:placeholder-gray-400 bg-transparent text-gray-900 dark:text-gray-100"
              placeholder="جستجو..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          )}
          <div className="overflow-y-auto max-h-72 px-2 py-1">
            <ul className="space-y-1">
              {filtered.map((o) => {
                const active = (selected as string[]).includes(o.value);
                return (
                  <li
                    key={o.value}
                    role="option"
                    aria-selected={active}
                    onClick={() => toggle(o.value)}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-base font-medium rounded-xl transition-all duration-200 ease-in-out ${
                      active
                        ? "bg-cyan-50/50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300"
                        : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    } text-gray-900 dark:text-gray-100`}
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
                      <span className="text-gray-600 dark:text-gray-400">
                        {o.icon}
                      </span>
                    )}
                    <span className="flex-1 truncate">{o.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
            {multiple ? (
              <>
                <button
                  className="btn btn-tone px-5 py-2 text-sm font-medium rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 text-gray-900 dark:text-gray-100"
                  onClick={() => setOpen(false)}
                >
                  اعمال
                </button>
                <button
                  className="btn btn-ghost px-5 py-2 text-sm font-medium rounded-md hover:text-red-500 transition-all duration-200 text-gray-900 dark:text-gray-100"
                  onClick={() => onChange([])}
                >
                  پاک‌سازی
                </button>
              </>
            ) : (
              <button
                className="btn btn-ghost px-5 py-2 text-sm font-medium rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 text-gray-900 dark:text-gray-100"
                onClick={() => setOpen(false)}
              >
                بستن
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
