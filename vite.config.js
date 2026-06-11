import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

const APP_VERSION = pkg.version
const APP_BUILD_TIME = new Date().toISOString()
const APP_COMMIT = (() => {
  if (process.env.GIT_SHA) return process.env.GIT_SHA.slice(0, 7)
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return 'dev'
  }
})()

const versionJsonPlugin = () => ({
  name: 'pnlq-version-json',
  apply: 'build',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'version.json',
      source: JSON.stringify(
        { version: APP_VERSION, buildTime: APP_BUILD_TIME, commit: APP_COMMIT },
        null,
        2,
      ),
    })
  },
})

const BASE = '/BTMM_JORNADAS/'

export default defineConfig({
  base: BASE,
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __APP_BUILD_TIME__: JSON.stringify(APP_BUILD_TIME),
    __APP_COMMIT__: JSON.stringify(APP_COMMIT),
    __APP_VERSION_URL__: JSON.stringify(`${BASE}version.json`),
  },
  plugins: [
    react(),
    versionJsonPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      base: BASE,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        sourcemap: false,
        navigateFallbackDenylist: [/^\/version\.json$/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/version.json'),
            handler: 'NetworkOnly',
            options: { cacheName: 'pnlq-version-check' },
          },
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pnlq-html-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style'  ||
              request.destination === 'image'  ||
              request.destination === 'font',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pnlq-assets-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'PNLQ — Gestión de Jornadas Laborales',
        short_name: 'PNLQ',
        description: 'Sistema de gestión de jornadas laborales — Parque Nacional Los Quetzales · SINAC · Costa Rica',
        theme_color: '#064e3b',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'any',
        scope: BASE,
        start_url: BASE,
        lang: 'es',
        categories: ['productivity', 'utilities'],
        // Atajos (shortcuts) accesibles desde el menú contextual del icono
        // de la PWA (long-press en Android, right-click en escritorio).
        // Mejoran el descubrimiento de vistas y aportan a la calificación
        // PWA de Lighthouse.
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Resumen de cobertura, alertas y KPIs del día/mes',
            url: BASE + '#dashboard',
          },
          {
            name: 'Roles',
            short_name: 'Roles',
            description: 'Roles mensuales de turno por funcionario',
            url: BASE + '#roles',
          },
          {
            name: 'Planificación',
            short_name: 'Plan',
            description: 'Planificación general de actividades',
            url: BASE + '#planificacion',
          },
          {
            name: 'Alertas',
            short_name: 'Alertas',
            description: 'Listado completo de alertas del sistema',
            url: BASE + '#alertas',
          },
        ],
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
})
