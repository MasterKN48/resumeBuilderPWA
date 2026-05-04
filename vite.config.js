import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'icons/*', '1.jpg', '2.jpg'],
      manifest: {
        name: 'ProResume - Professional Resume Builder',
        short_name: 'ProResume',
        description: 'A modern, highly customizable, and offline-capable interactive resume builder.',
        theme_color: '#d86244',
        background_color: '#fdfaf6',
        display: 'standalone',
        screenshots: [
          {
            src: '1.jpg',
            sizes: '1080x1920',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Resume Editor'
          },
          {
            src: '2.jpg',
            sizes: '1080x1920',
            type: 'image/jpeg',
            form_factor: 'narrow',
            label: 'Print Preview'
          }
        ],
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
