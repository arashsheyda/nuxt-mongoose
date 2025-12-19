import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'
import { defineNuxtModule } from '@nuxt/kit'
import { startSubprocess } from '@nuxt/devtools-kit'
import { CLIENT_PORT } from '../src/constants'

export default defineNuxtConfig({
  modules: [
    '../src/module',
    defineNuxtModule({
      setup(_, nuxt) {
        if (!nuxt.options.dev)
          return

        startSubprocess(
          {
            command: 'npx',
            args: ['nuxi', 'dev', '--port', CLIENT_PORT.toString()],
            cwd: resolve(__dirname, '../client'),
          },
          {
            id: 'nuxt-mongoose:client',
            name: 'Nuxt Mongoose Client Dev',
          },
        )
      },
    }),
  ],
  devtools: {
    enabled: true,
  },
  compatibilityDate: '2025-12-18',
})
