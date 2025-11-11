import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
};

export default function ButtonPro({
  children, onClick, variant = "primary", size = "md", loading, disabled
}: Props) {
  const base = "inline-flex items-center justify-center rounded-[var(--radius-full)] font-medium transition-all";
  const sizes = {
    sm: "px-3 py-2 text-[var(--font-sm)]",
    md: "px-4 py-2.5 text-[var(--font-base)]",
    lg: "px-5 py-3 text-[var(--font-lg)]"
  };
  const variants = {
    primary:
      "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:brightness-[1.08] shadow-[var(--shadow-sm)]",
    ghost:
      "bg-transparent border border-[var(--color-border)] text-[var(--fg-1)] hover:text-[var(--color-primary)]"
  };
  const state = disabled || loading ? "opacity-60 cursor-not-allowed" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${state}`}
      style={{ transitionDuration: "var(--duration-normal)", transitionTimingFunction: "var(--easing-default)" as any }}
    >
      {loading && (
        <svg className="animate-spin mr-2 h-5 w-5 text-[var(--color-on-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      )}
      {children}
    </button>
  );
}
