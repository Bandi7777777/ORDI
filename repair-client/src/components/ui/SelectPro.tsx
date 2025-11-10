// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\components\ui\SelectPro.tsx
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
  searchable?: boolean;
};

export default function SelectPro({
  value, multiple=false, onChange, options, placeholder="انتخاب...", className="", ariaLabel, searchable=false
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQ] = useState("");
  const [anchor, setAnchor] = useState<DOMRect>();
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(()=> Array.isArray(value)? value : (value ? [value] : []), [value]);

  useEffect(()=>{
    function onDoc(e: MouseEvent){
      const t = e.target as Node;
      if (!popRef.current || !btnRef.current) return;
      if (!popRef.current.contains(t) && !btnRef.current.contains(t)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return ()=> document.removeEventListener("mousedown", onDoc);
  }, []);

  function openPop(){
    setOpen(true);
    const r = btnRef.current!.getBoundingClientRect();
    setAnchor(r);
  }

  function toggle(val: string){
    if (!multiple) { onChange(val); setOpen(false); return; }
    const set = new Set<string>(selected as string[]);
    set.has(val) ? set.delete(val) : set.add(val);
    onChange(Array.from(set));
  }

  const list = useMemo(()=>{
    const s = query.trim();
    const base = s? options.filter(o=>o.label.includes(s) || o.value.includes(s)) : options;
    const grouped: Record<string, typeof base> = {};
    for (const o of base){
      const g = o.group ?? "گزینه‌ها";
      (grouped[g] = grouped[g] || []).push(o);
    }
    return grouped;
  }, [options, query]);

  function displayLabel(){
    if (!selected.length) return placeholder;
    if (!multiple) return options.find(o=>o.value===value)?.label ?? String(value);
    const labels = (selected as string[]).map(v => options.find(o=>o.value===v)?.label ?? v);
    const shown = labels.slice(0,2).join("، ");
    const rest = labels.length - 2;
    return rest>0 ? `${shown} +${rest}` : shown;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        className="btn-tone w-full justify-between"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={openPop}
      >
        <span className="truncate">{displayLabel()}</span>
        <span className="opacity-70">▾</span>
      </button>

      {open && anchor && (
        <div
          ref={popRef}
          className="select-popover"
          style={{
            position:"fixed", zIndex: 60, top: (window.scrollY + anchor.bottom + 4) + "px",
            left: (window.scrollX + anchor.left) + "px", width: `${anchor.width}px`,
            background:"rgba(0,0,0,.6)", backdropFilter:"blur(10px)", border:"1px solid var(--line)", borderRadius:"12px",
            boxShadow:"0 12px 30px rgba(0,0,0,.5)", padding:"8px"
          }}
        >
          {searchable && (
            <input className="input w-full mb-2" placeholder="جستجو..." value={query} onChange={e=>setQ(e.target.value)} />
          )}
          <div style={{maxHeight:"260px", overflow:"auto"}}>
            {Object.entries(list).map(([g, arr])=>(
              <div key={g} style={{marginBottom:8}}>
                <div style={{padding:"2px 6px", fontSize:12, opacity:.7}}>{g}</div>
                <ul style={{listStyle:"none", padding:0, margin:0}}>
                  {arr.map(o=> {
                    const active = (selected as string[]).includes(o.value);
                    return (
                      <li
                        key={o.value}
                        role="option"
                        aria-selected={active}
                        onClick={()=>toggle(o.value)}
                        style={{
                          padding:"8px 10px", display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                          background: active ? "rgba(72,228,255,.15)" : "transparent",
                        }}
                        onMouseEnter={(e)=>((e.currentTarget as HTMLLIElement).style.background="rgba(255,255,255,.06)")}
                        onMouseLeave={(e)=>((e.currentTarget as HTMLLIElement).style.background = active ? "rgba(72,228,255,.15)" : "transparent")}
                      >
                        {multiple && <input type="checkbox" readOnly checked={!!active} />}
                        {o.icon && <span style={{opacity:.9}}>{o.icon}</span>}
                        <span style={{flex:1}}>{o.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div style={{display:"flex", gap:8, paddingTop:8}}>
            {multiple ? (
              <>
                <button className="btn btn-tone text-xs" onClick={()=>setOpen(false)}>اعمال</button>
                <button className="btn btn-ghost text-xs" onClick={()=>{ onChange([]); }}>پاک‌سازی</button>
              </>
            ) : (
              <button className="btn btn-ghost text-xs" onClick={()=>setOpen(false)}>بستن</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
