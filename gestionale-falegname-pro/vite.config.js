import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/falegname.v2/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Gestionale Falegname Pro",
        short_name: "GF Pro",
        start_url: "/falegname.v2/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0ea5e9",
        icons: [
          { src: "/falegname.v2/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/falegname.v2/icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
});
