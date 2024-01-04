import {
  addServerPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
  logger,
} from '@nuxt/kit'
import defu from 'defu'
import { join } from 'pathe'
import type { ConnectOptions } from 'mongoose'
import type { Nuxt, RuntimeConfig } from 'nuxt/schema'
import mongoose from 'mongoose'
import { setupDevToolsUI } from './devtools'
import { checkForNewVersion } from './utils/functions'

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

// --- setup functions START ---
const { resolve } = createResolver(import.meta.url)

async function configureMongooseOptions(
  options: ModuleOptions,
  nuxt: Nuxt,
): Promise<RuntimeConfig | undefined> {
  if (!options.uri) {
    logger.warn(
      'Missing MongoDB URI. You can set it in your `nuxt.config` or in your `.env` as `MONGODB_URI`',
    )
    return
  }

  const config: RuntimeConfig = nuxt.options.runtimeConfig

  config.mongoose = defu(config.mongoose || {}, {
    uri: options.uri,
    options: options.options,
    devtools: options.devtools,
    modelsDir: join(nuxt.options.serverDir, options.modelsDir!),
  })

  return config
}

async function setupAliasesAndImports(
  options: ModuleOptions,
  config: RuntimeConfig,
  nuxt: Nuxt,
) {
  // virtual imports
  nuxt.hook('nitro:config', (_config) => {
    _config.alias = _config.alias || {}

    // Inline module runtime in Nitro bundle
    _config.externals = defu(
      typeof _config.externals === 'object' ? _config.externals : {},
      {
        inline: [resolve('./runtime')],
      },
    )
    _config.alias['#nuxt/mongoose'] = resolve('./runtime/server/services')

    if (_config.imports) {
      _config.imports.dirs = _config.imports.dirs || []
      _config.imports.dirs?.push(config.mongoose.modelsDir)
    }
  })

  addTemplate({
    filename: 'types/nuxt-mongoose.d.ts',
    getContents: () =>
      [
        'declare module \'#nuxt/mongoose\' {',
        `  const defineMongooseConnection: typeof import('${resolve(
          './runtime/server/services',
        )}').defineMongooseConnection`,
        `  const defineMongooseModel: typeof import('${resolve(
          './runtime/server/services',
        )}').defineMongooseModel`,
        '}',
      ].join('\n'),
  })

  nuxt.hook('prepare:types', (options) => {
    options.references.push({
      path: resolve(nuxt.options.buildDir, 'types/nuxt-mongoose.d.ts'),
    })
  })

  const isDevToolsEnabled
    = typeof nuxt.options.devtools === 'boolean'
      ? nuxt.options.devtools
      : nuxt.options.devtools.enabled
  if (nuxt.options.dev && isDevToolsEnabled)
    setupDevToolsUI(options, resolve, nuxt)

  // Add server-plugin for database connection
  addServerPlugin(resolve('./runtime/server/plugins/mongoose.db'))
}
// --- setup functions END ---

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mongoose',
    configKey: 'mongoose',
  },
  defaults: {
    // eslint-disable-next-line node/prefer-global/process
    uri: process.env.MONGODB_URI as string,
    devtools: true,
    options: {},
    modelsDir: 'models',
  },
  hooks: {
    close: () => {
      mongoose.disconnect()
    },
  },
  async setup(options, nuxt) {
    if (nuxt.options.dev)
      await checkForNewVersion()

    const config = await configureMongooseOptions(options, nuxt)

    await setupAliasesAndImports(options, config as RuntimeConfig, nuxt)

    logger.success('`nuxt-mongoose` is ready!')
  },
})
