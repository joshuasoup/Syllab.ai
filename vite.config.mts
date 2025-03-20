import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    open: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@images": path.resolve(__dirname, "./src/images"),
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  publicDir: "public"
});
