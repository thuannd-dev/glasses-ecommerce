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

          const inPackage = (packageName: string): boolean => {
            const normalizedId = id.replace(/\\/g, "/");
            return normalizedId.includes(`/node_modules/${packageName}/`);
          };

          if (
            inPackage("react") ||
            inPackage("react-dom") ||
            inPackage("react-router") ||
            inPackage("react-router-dom") ||
            inPackage("@mui") ||
            inPackage("@emotion")
          ) {
            return "vendor-ui";
          }

          if (inPackage("@tanstack")) {
            return "vendor-query";
          }

          if (inPackage("three")) {
            return "vendor-three";
          }

          if (inPackage("recharts") || inPackage("d3")) {
            return "vendor-charts";
          }

          if (inPackage("leaflet") || inPackage("react-leaflet")) {
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
