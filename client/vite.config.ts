import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    outDir: "../API/wwwroot",
    chunkSizeWarningLimit: 1500,
    emptyOutDir: true, //clean wwwroot folder before each build
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@mui") ||
            id.includes("node_modules/@emotion")
          ) {
            return "vendor-ui";
          }

          if (id.includes("node_modules/@tanstack")) {
            return "vendor-query";
          }

          if (
            id.includes("node_modules/three") ||
            id.includes("node_modules/@types/three")
          ) {
            return "vendor-three";
          }

          if (
            id.includes("node_modules/recharts") ||
            id.includes("node_modules/d3")
          ) {
            return "vendor-charts";
          }

          if (
            id.includes("node_modules/leaflet") ||
            id.includes("node_modules/react-leaflet")
          ) {
            return "vendor-maps";
          }

          return undefined;
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  plugins: [react(), mkcert()],
});
