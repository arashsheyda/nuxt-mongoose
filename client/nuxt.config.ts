import { resolve } from 'pathe'
import { PATH_CLIENT } from '../src/constants'

export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxt/devtools-ui-kit',
  ],
  nitro: {
    output: {
      publicDir: resolve(__dirname, '../dist/client'),
    },
  },
  app: {
    baseURL: PATH_CLIENT,
  },
})
