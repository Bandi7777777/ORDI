import { ReactNode } from "react";
import type { Theme, Palette } from "../types";

type View = "list" | "orders" | "dashboard" | "settings";

type Props = {
  children: ReactNode;
  current: View;
  onNavigate: (view: View) => void;
  theme: Theme;
  onThemeToggle?: (next: Theme) => void;
  palette?: Palette;
  onPaletteChange?: (p: Palette) => void;
};

export default function Layout({
  children,
  current,
  onNavigate,
  theme,
  onThemeToggle,
  palette = "ink",
  onPaletteChange,
}: Props) {
  const handleThemeToggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    onThemeToggle?.(nextTheme);
  };

  const handlePaletteToggle = () => {
    const palettes: Palette[] = ["ink", "prism", "sunset"];
    const idx = palettes.indexOf(palette);
    const nextPalette = palettes[(idx + 1) % palettes.length];
    onPaletteChange?.(nextPalette);
  };

  const SunIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 1v3 M12 20v3 M4 12H1 M20 12h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
  const MoonIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
  const PaletteIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );

  const themeIcon = theme === "dark" ? SunIcon : MoonIcon;

  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="mx-auto shell py-3 flex items-center justify-between">
          {/* Brand and title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="brand"
              onClick={() => onNavigate("list")}
              title="خانه"
            >
              R
            </button>
            <h1 className="text-base font-bold">Ordi — Repair Tracker</h1>
          </div>

          {/* Navigation */}
          <nav
            className="flex items-center gap-2"
            style={{ position: "relative", zIndex: 1 }}
          >
            <button
              className={`navlink ${current === "list" ? "underline" : ""}`}
              onClick={() => onNavigate("list")}
            >
              خانه
            </button>
            <button
              className={`navlink ${current === "orders" ? "underline" : ""}`}
              onClick={() => onNavigate("orders")}
            >
              سفارش‌ها
            </button>
            <button
              className={`navlink ${
                current === "dashboard" ? "underline" : ""
              }`}
              onClick={() => onNavigate("dashboard")}
            >
              داشبورد
            </button>
            <button
              className={`navlink ${
                current === "settings" ? "underline" : ""
              }`}
              onClick={() => onNavigate("settings")}
            >
              تنظیمات
            </button>

            {/* Theme toggle */}
            <button
              className="navlink"
              onClick={handleThemeToggle}
              title="تغییر تم"
            >
              {themeIcon}
              <span className="hidden sm:inline">تم</span>
            </button>

            {/* Palette toggle */}
            <button
              className="navlink"
              onClick={handlePaletteToggle}
              title="تغییر پالت رنگ"
            >
              {PaletteIcon}
              <span className="hidden sm:inline">پالت</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="shell py-6">{children}</main>
    </div>
  );
}
