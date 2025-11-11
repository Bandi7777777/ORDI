import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

export type SelectOption = { label: string; value: string; icon?: JSX.Element; group?: string };

type Props = {
  value?: string | string[];
  multiple?: boolean;
  onChange: (v: any) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  searchable?: boolean; // دیفالت false
};

export default function SelectPro({
  value, multiple = false, onChange, options,
  placeholder = "انتخاب…", className = "", ariaLabel, searchable = false
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [rect, setRect] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const selected = useMemo(() => Array.isArray(value) ? value : (value ? [value] : []), [value]);

  function openPop() {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setRect({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const on = () => {
      if (!btnRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      setRect({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, width: r.width });
    };
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current || !btnRef.current) return;
      if (!popRef.current.contains(t) && !btnRef.current.contains(t)) setOpen(false);
    };
    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);
    document.addEventListener("mousedown", onDoc);
    return () => { window.removeEventListener("scroll", on, true); window.removeEventListener("resize", on); document.removeEventListener("mousedown", onDoc); };
  }, [open]);

  const selLabel = useMemo(() => {
    if (multiple) return selected.length ? selected.length + " انتخاب شده" : placeholder;
    const s = options.find(o => o.value === value)?.label;
    return s || placeholder;
  }, [value, multiple, options, placeholder, selected.length]);

  const filtered = useMemo(() => {
    const fq = q.toLowerCase();
    return fq ? options.filter(o => o.label.toLowerCase().includes(fq) || o.value.toLowerCase().includes(fq)) : options;
  }, [q, options]);

  function toggle(v: string) {
    if (multiple) {
      const arr = selected as string[];
      onChange(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
      if (!arr.includes(v) && !searchable) setOpen(false);
    } else {
      onChange(v);
      setOpen(false);
    }
    setQ("");
  }

  return (
    <div className={`relative ${className}`}>
      <button ref={btnRef} type="button" onClick={openPop}
        className="input px-4 py-3 w-full flex items-center justify-between text-base font-medium rounded-xl shadow-sm hover:shadow-md border border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        aria-label={ariaLabel}>
        <span className="truncate">{selLabel}</span>
        <svg className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && createPortal(
        <div ref={popRef} className="fixed bg-white/10 dark:bg-black/80 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50 transition-all duration-300 ease-out"
          style={{ position: "absolute", top: rect.top, left: rect.left, minWidth: rect.width, maxWidth: "calc(100vw - 2rem)" }}>
          {searchable && (
            <input className="w-full px-4 py-3 text-base border-b border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:border-indigo-500 transition-colors duration-200 placeholder-gray-500 dark:placeholder-gray-400 bg-transparent text-gray-900 dark:text-gray-100"
              placeholder="جستجو..." value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
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
                      active ? "bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300" : "hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    } text-gray-900 dark:text-gray-100`}
                  >
                    {multiple && <input type="checkbox" readOnly checked={active} className="accent-indigo-500 rounded border-gray-300 dark:border-gray-600" />}
                    {o.icon && <span className="text-gray-600 dark:text-gray-400">{o.icon}</span>}
                    <span className="flex-1 truncate">{o.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
            {multiple ? (
              <>
                <button className="btn btn-tone px-5 py-2 text-sm font-medium rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 text-gray-900 dark:text-gray-100" onClick={() => setOpen(false)}>اعمال</button>
                <button className="btn btn-ghost px-5 py-2 text-sm font-medium rounded-md hover:text-red-500 transition-all duration-200 text-gray-900 dark:text-gray-100" onClick={() => onChange([])}>پاک‌سازی</button>
              </>
            ) : (
              <button className="btn btn-ghost px-5 py-2 text-sm font-medium rounded-md hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 text-gray-900 dark:text-gray-100" onClick={() => setOpen(false)}>بستن</button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}