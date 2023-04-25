import { resolve } from 'pathe'
import { PATH_CLIENT } from '../src/constants'

export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxt/devtools-ui-kit',
  ],
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
  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },
  },
  app: {
    baseURL: PATH_CLIENT,
  },
})
