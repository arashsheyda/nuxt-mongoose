import {
  addImportsDir,
  addServerPlugin,
  addTemplate,
  addVitePlugin,
  createResolver,
  defineNuxtModule,
  logger,
} from '@nuxt/kit'
import { pathExists } from 'fs-extra'
import { join } from 'pathe'
import { defu } from 'defu'
import sirv from 'sirv'
import { $fetch } from 'ofetch'
import { version } from '../package.json'

import { PATH_CLIENT } from './constants'
import type { ModuleOptions } from './types'

import { setupRPC } from './server-rpc'

export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mongoose',
    configKey: 'mongoose',
  },
  defaults: {
    uri: process.env.MONGODB_URI as string,
    devtools: true,
    options: {},
    modelsDir: 'models',
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeConfig = nuxt.options.runtimeConfig

    if (nuxt.options.dev) {
      $fetch('https://registry.npmjs.org/nuxt-mongoose/latest').then((release) => {
        if (release.version > version)
          logger.info(`A new version of Nuxt Mongoose (v${release.version}) is available: https://github.com/arashsheyda/nuxt-mongoose/releases/latest`)
      }).catch(() => {})
    }

    addImportsDir(resolve('./runtime/composables'))

    if (!options.uri) {
      logger.warn('Missing `MONGODB_URI` in `.env`')
      return
    }

    // Runtime Config
    runtimeConfig.mongoose = defu(runtimeConfig.mongoose || {}, {
      uri: options.uri,
      options: options.options,
      devtools: options.devtools,
      modelsDir: options.modelsDir,
    })

    // Setup devtools UI
    const distResolve = (p: string) => {
      const cwd = resolve('.')
      if (cwd.endsWith('/dist'))
        return resolve(p)
      return resolve(`../dist/${p}`)
    }

    const clientPath = distResolve('./client')
    const { vitePlugin } = setupRPC(nuxt, options)

    addVitePlugin(vitePlugin)

    nuxt.hook('vite:serverCreated', async (server) => {
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

    // Nitro auto imports
    nuxt.hook('nitro:config', (_nitroConfig) => {
      if (_nitroConfig.imports) {
        _nitroConfig.imports.dirs = _nitroConfig.imports.dirs || []
        _nitroConfig.imports.dirs?.push(
          join(nuxt.options.serverDir, runtimeConfig.mongoose.modelsDir),
        )
      }
    })

    // Add server-plugin for database connection
    addServerPlugin(resolve('./runtime/server/plugins/mongoose.db'))

    logger.success('`nuxt-mongoose` is ready!')
  },
})
