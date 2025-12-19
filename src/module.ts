import {
  addServerPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit'
import type { ConnectOptions } from 'mongoose'
import defu from 'defu'
import { join } from 'pathe'
import mongoose from 'mongoose'
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
    uri: String(process.env.MONGODB_URI || ''),
    devtools: true,
    options: {},
    modelsDir: 'models',
  },
  hooks: {
    close: () => {
      mongoose.disconnect()
    },
  },
  async setup(_options, _nuxt) {
    const logger = useLogger('nuxt-mongoose')

    if (_nuxt.options.dev) {
      $fetch('https://registry.npmjs.org/nuxt-mongoose/latest').then((release) => {
        if (release.version > version)
          logger.info(`A new version of Nuxt Mongoose (v${release.version}) is available: https://github.com/arashsheyda/nuxt-mongoose/releases/latest`)
      }).catch(() => {})
    }

    if (!_options.uri) {
      logger.warn('Missing MongoDB URI. You can set it in your `nuxt.config` or in your `.env` as `MONGODB_URI`')
    }

    const { resolve } = createResolver(import.meta.url)
    const config = _nuxt.options.runtimeConfig as any

    config.mongoose = defu(config.mongoose || {}, {
      uri: _options.uri,
      options: _options.options,
      devtools: _options.devtools,
      modelsDir: join(_nuxt.options.serverDir, _options.modelsDir!),
    })

    // virtual imports
    _nuxt.hook('nitro:config', (_config) => {
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

    _nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: resolve(_nuxt.options.buildDir, 'types/nuxt-mongoose.d.ts') })
    })

    const isDevToolsEnabled = typeof _nuxt.options.devtools === 'boolean' ? _nuxt.options.devtools : _nuxt.options.devtools.enabled
    if (_nuxt.options.dev && isDevToolsEnabled)
      setupDevToolsUI(_options, resolve, _nuxt)

    // Add server-plugin for database connection
    addServerPlugin(resolve('./runtime/server/plugins/mongoose.db'))

    logger.success('`nuxt-mongoose` is ready!')
  },
})
