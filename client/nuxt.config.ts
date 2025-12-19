import { resolve } from 'pathe'
import { CLIENT_PATH } from '../src/constants'

export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools-ui-kit',
  ],
  ssr: false,
  app: {
    baseURL: CLIENT_PATH,
  },
  compatibilityDate: '2025-12-18',
  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },
  },
  vite: {

  },
  unocss: {
    shortcuts: {
      'bg-base': 'bg-white dark:bg-[#151515]',
      'bg-active': 'bg-gray:5',
      'bg-hover': 'bg-gray:3',
      'border-base': 'border-gray/20',
      'glass-effect': 'backdrop-blur-6 bg-white/80 dark:bg-[#151515]/90',
      'navbar-glass': 'sticky z-10 top-0 glass-effect',
    },
  },
})
