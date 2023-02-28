import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import EnvironmentPlugin from "vite-plugin-environment";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), EnvironmentPlugin(["MAPBOX_TOKEN"])],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/getCityBoundary": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
      "/osmRequestCache": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
