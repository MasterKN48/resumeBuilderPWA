import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    preact(),
    VitePWA({
      registerType: "autoUpdate",
      manifestFilename: "manifest.json",
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
        "masked-icon.svg",
        "icons/*",
        "1.jpg",
        "2.jpg",
      ],
      manifest: {
        name: "PocketResume - Instant Offline Resume Builder",
        short_name: "PocketResume",
        description:
          "Easy, instant resume management with full offline capabilities.",
        theme_color: "#2d2d2d",
        background_color: "#fdfaf6",
        display: "standalone",
        screenshots: [
          {
            src: "1.jpg",
            sizes: "1080x1920",
            type: "image/jpeg",
            form_factor: "narrow",
            label: "Resume Editor Mobile",
          },
          {
            src: "2.jpg",
            sizes: "1080x1920",
            type: "image/jpeg",
            form_factor: "narrow",
            label: "Print Preview Mobile",
          },
          {
            src: "1-desktop.jpg",
            sizes: "1920x1080",
            type: "image/jpeg",
            form_factor: "wide",
            label: "Resume Editor Desktop",
          },
          {
            src: "2-desktop.jpg",
            sizes: "1920x1080",
            type: "image/jpeg",
            form_factor: "wide",
            label: "Print Preview Desktop",
          },
        ],
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
