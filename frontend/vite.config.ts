import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, proxy API + actuator calls to the BFF so the browser talks to a single origin
// (no CORS needed) and the frontend code uses relative URLs.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/actuator": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
});
