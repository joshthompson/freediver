import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    devtools(),
    solidPlugin(),
    VitePWA({
      registerType: 'autoUpdate',

      scope: '/freediver/',

      manifest: {
        name: 'Alisa: The Freediver',
        short_name: 'Freediver',
        start_url: '/freediver/',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          }
        ]
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,woff,mp3}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // allow files up to 3 MB
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@style': path.resolve(__dirname, 'styled-system'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  base: '/freediver/',
});
