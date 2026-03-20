import { resolve } from 'pathe'
import { CLIENT_PATH, CLIENT_PORT } from '../src/constants'

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
  ],
  ssr: false,
  devtools: {
    enabled: false,
  },
  app: {
    baseURL: CLIENT_PATH,
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-12-18',
  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: CLIENT_PORT,
        clientPort: CLIENT_PORT,
      },
    },
  },
})
