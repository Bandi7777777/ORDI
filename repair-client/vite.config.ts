import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";     // ← هم‌نام با بسته‌ی نصب‌شده
import tailwind from "@tailwindcss/vite";

// نکته: PWA را فقط در production فعال می‌کنیم تا dev سفید نشود
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.VITE_PORT || 3006);

  const plugins = [react(), tailwind()];

  if (mode !== "development") {
    try {
      const { VitePWA } = await import("vite-plugin-pwa");
      plugins.push(
        VitePWA({
          registerType: "autoUpdate",
          injectRegister: "auto",
          workbox: { globPatterns: ["**/*"] },
          includeAssets: ["favicon.ico", "robots.txt"],
          manifest: {
            name: "سامانه‌ی تعمیر قطعات",
            short_name: "Repair",
            theme_color: "#0b0f14",
            background_color: "#0b0f14",
            display: "standalone",
            start_url: "/",
            icons: [
              { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
              { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
              { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
            ]
          },
          devOptions: { enabled: false } // ← در dev خاموش
        })
      );
    } catch {
      // اگر vite-plugin-pwa نصب نبود، بی‌خیال
    }
  }

  return {
    plugins,
    server: { port, strictPort: true },
    preview: { port, strictPort: true },
    build: {
      target: "es2022",
      minify: "esbuild",
      chunkSizeWarningLimit: 1000,
      sourcemap: mode === "development"
    }
  };
});
