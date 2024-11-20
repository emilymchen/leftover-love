import vue from "@vitejs/plugin-vue";
import { join } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/",
  resolve: {
    alias: {
      "@": join(__dirname, "client"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
