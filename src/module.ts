import { addServerPlugin, addTemplate, createResolver, defineNuxtModule, logger } from '@nuxt/kit'
import { pathExists } from 'fs-extra'
import { tinyws } from 'tinyws'
import { defu } from 'defu'
import sirv from 'sirv'

import { PATH_CLIENT, PATH_ENTRY } from './constants'
import type { ModuleOptions } from './types'

import { setupRPC } from './server-rpc'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mongoose',
    configKey: 'mongoose',
  },
  defaults: {
    uri: process.env.MONGODB_URI as string,
    devtools: true,
    options: {},
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    if (!options.uri)
      console.warn('Missing `MONGODB_URI` in `.env`')

    // Public runtimeConfig
    nuxt.options.runtimeConfig.public.mongoose = defu(nuxt.options.runtimeConfig.public.mongoose || {}, {
      uri: options.uri,
      options: options.options,
      devtools: options.devtools,
    })

    // Setup devtools UI
    const distResolve = (p: string) => {
      const cwd = resolve('.')
      if (cwd.endsWith('/dist'))
        return resolve(p)
      return resolve(`../dist/${p}`)
    }

    const clientPath = distResolve('./client')
    const { middleware: rpcMiddleware } = setupRPC(nuxt, options)

    nuxt.hook('vite:serverCreated', async (server) => {
      server.middlewares.use(PATH_ENTRY, tinyws() as any)
      server.middlewares.use(PATH_ENTRY, rpcMiddleware as any)
      if (await pathExists(clientPath))
        server.middlewares.use(PATH_CLIENT, sirv(clientPath, { dev: true, single: true }))
    })

    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore runtime type
    nuxt.hook('devtools:customTabs', (iframeTabs) => {
      iframeTabs.push({
        name: 'mongoose',
        title: 'Mongoose',
        icon: 'skill-icons:mongodb',
        view: {
          type: 'iframe',
          src: PATH_CLIENT,
        },
      })
    })

    // virtual imports
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}

      // Inline module runtime in Nitro bundle
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [resolve('./runtime')],
      })
      nitroConfig.alias['#nuxt/mongoose'] = resolve('./runtime/server/services')
    })

    addTemplate({
      filename: 'types/nuxt-mongoose.d.ts',
      getContents: () => [
        'declare module \'#nuxt/mongoose\' {',
        `  const defineMongooseConnection: typeof import('${resolve('./runtime/server/services')}').defineMongooseConnection`,
        `  const defineMongooseModel: typeof import('${resolve('./runtime/server/services')}').defineMongooseModel`,
        '}',
      ].join('\n'),
    })

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(nuxt.options.buildDir, 'types/nuxt-mongoose.d.ts') })
    })

    // Add server-plugin for database connection
    addServerPlugin(resolve('./runtime/server/plugins/mongoose.db'))

    logger.success('`nuxt-mongoose` is ready!')
  },
})
