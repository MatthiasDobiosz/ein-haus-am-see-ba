import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import EnvironmentPlugin from "vite-plugin-environment";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), EnvironmentPlugin(["MAPBOX_TOKEN"])],
  server: {
    host: true,
    port: 5175,
    proxy: {
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
      "/getHouses": {
        target: "http://localhost:3200",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
