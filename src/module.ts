import {
  addServerPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
  logger,
} from '@nuxt/kit'
import type { ConnectOptions } from 'mongoose'
import defu from 'defu'
import { join } from 'pathe'
import { $fetch } from 'ofetch'
import { version } from '../package.json'
import { setupDevToolsUI } from './devtools'

export interface ModuleOptions {
  /**
   *  The MongoDB URI connection
   *
   * @default process.env.MONGODB_URI
   *
  */
  uri: string | undefined
  /**
   *  Nuxt DevTools
   *
   * @default true
   *
  */
  devtools: boolean
  /**
   *  Mongoose Connections
   *
   * @default {}
  */
  options?: ConnectOptions
  /**
   *  Models Directory for auto-import
   *
   * @default 'models'
   *
  */
  modelsDir?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mongoose',
    configKey: 'mongoose',
  },
  defaults: {
    // eslint-disable-next-line n/prefer-global/process
    uri: process.env.MONGODB_URI as string,
    devtools: true,
    options: {},
    modelsDir: 'models',
  },
  async setup(options, nuxt) {
    if (nuxt.options.dev) {
      $fetch('https://registry.npmjs.org/nuxt-mongoose/latest').then((release) => {
        if (release.version > version)
          logger.info(`A new version of Nuxt Mongoose (v${release.version}) is available: https://github.com/arashsheyda/nuxt-mongoose/releases/latest`)
      }).catch(() => {})
    }

    if (!options.uri) {
      logger.warn('Missing MongoDB URI. You can set it in your `nuxt.config` or in your `.env` as `MONGODB_URI`')
      return
    }

    const { resolve } = createResolver(import.meta.url)
    const config = nuxt.options.runtimeConfig as any

    config.mongoose = defu(config.mongoose || {}, {
      uri: options.uri,
      options: options.options,
      devtools: options.devtools,
      modelsDir: join(nuxt.options.serverDir, options.modelsDir!),
    })

    // virtual imports
    nuxt.hook('nitro:config', (_config) => {
      _config.alias = _config.alias || {}

      // Inline module runtime in Nitro bundle
      _config.externals = defu(typeof _config.externals === 'object' ? _config.externals : {}, {
        inline: [resolve('./runtime')],
      })
      _config.alias['#nuxt/mongoose'] = resolve('./runtime/server/services')

      if (_config.imports) {
        _config.imports.dirs = _config.imports.dirs || []
        _config.imports.dirs?.push(config.mongoose.modelsDir)
      }
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

    const isDevToolsEnabled = typeof nuxt.options.devtools === 'boolean' ? nuxt.options.devtools : nuxt.options.devtools.enabled
    if (nuxt.options.dev && isDevToolsEnabled)
      setupDevToolsUI(options, resolve, nuxt)

    // Add server-plugin for database connection
    addServerPlugin(resolve('./runtime/server/plugins/mongoose.db'))

    logger.success('`nuxt-mongoose` is ready!')
  },
})
