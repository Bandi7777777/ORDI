// D:\Projects\1. Website\1.Code\6. REPAIR\repair-client\src\components\Layout.tsx
import { ReactNode } from "react";
import type { Theme, Palette } from "../types";

type Props = { children:ReactNode; current:"list"|"dashboard"|"settings"; onNavigate:(v:Props["current"])=>void; theme:Theme; onThemeToggle?:(t:Theme)=>void; palette?:Palette; onPaletteChange?:(p:Palette)=>void; };

export default function Layout({ children, current, onNavigate, theme, onThemeToggle, palette="ink", onPaletteChange }:Props){
  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button type="button" className="brand" onClick={()=>onNavigate("list")} title="خانه">R</button>
            <div><h1 className="text-base font-bold">Ordi — Repair Tracker</h1></div>
          </div>
          <nav className="flex items-center gap-2" style={{position:"relative", zIndex:1}}>
            <button className={`navlink ${current==="list"?"underline":""}`} onClick={()=>onNavigate("list")}>خانه</button>
            <button className={`navlink ${current==="dashboard"?"underline":""}`} onClick={()=>onNavigate("dashboard")}>داشبورد</button>
            <button className={`navlink ${current==="settings"?"underline":""}`} onClick={()=>onNavigate("settings")}>تنظیمات</button>
            <select className="select text-xs" value={theme} onChange={(e)=>onThemeToggle?.(e.target.value as Theme)} title="تم">
              <option value="system">سیستمی</option><option value="light">روشن</option><option value="dark">تیره</option>
            </select>
            <select className="select text-xs" value={palette} onChange={(e)=>onPaletteChange?.(e.target.value as Palette)} title="پالت">
              <option value="ink">Ink</option><option value="prism">Prism</option><option value="sunset">Sunset</option>
            </select>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
