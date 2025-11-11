// خواندن JSON و export ایمن
import tokens from "./tokens.json";

export type Palette = "ink" | "prism" | "sunset";

export function applyPalette(p: Palette) {
  document.body.classList.remove("theme-ink", "theme-prism", "theme-sunset");
  document.body.classList.add(`theme-${p}`);
}

export default tokens;
