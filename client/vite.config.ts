import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import EnvironmentPlugin from "vite-plugin-environment";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), EnvironmentPlugin(["MAPBOX_TOKEN"])],
  server: {
    host: true,
    proxy: {
      "/osmRequestCache": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
      "/postGISSingle": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
      "/postGISIndex": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
      "/postGISBuffer": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
      "/postGISNoBuffer": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
      "/postGISCombined": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
      "/postGISCombinedSingle": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
      "/backendLogs": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
      "/geocoder": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
