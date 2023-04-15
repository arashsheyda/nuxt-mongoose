import { addServerPlugin, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import type { ConnectOptions } from 'mongoose'

export interface ModuleOptions {
  uri?: string
  options?: ConnectOptions
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-mongoose',
    configKey: 'mongoose',
  },
  defaults: {
    uri: process.env.MONGODB_URI as string,
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
  },
})
