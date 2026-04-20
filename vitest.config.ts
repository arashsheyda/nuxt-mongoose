import { defineConfig } from 'vitest/config'
import { resolve } from 'pathe'

export default defineConfig({
  resolve: {
    alias: {
      '#nuxt/mongoose': resolve(__dirname, './src/runtime/server/services'),
    },
  },
  test: {
    environment: 'node',
  },
})
