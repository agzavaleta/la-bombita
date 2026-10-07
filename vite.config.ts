import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/pwa-icon-placeholder-180.png"],
      manifest: {
        name: "La Bombita",
        short_name: "La Bombita",
        display: "standalone",
        start_url: "/",
        background_color: "#fef2f2",
        theme_color: "#dc2626",
        lang: "es",
        icons: [
          {
            src: "/icons/pwa-icon-placeholder-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/pwa-icon-placeholder-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
