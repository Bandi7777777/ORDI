import type { Config } from "tailwindcss";
import tokensTw from "./src/design-tokens/tailwind.config";
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      ...tokensTw.theme.extend
    }
  },
  plugins: []
} satisfies Config;
