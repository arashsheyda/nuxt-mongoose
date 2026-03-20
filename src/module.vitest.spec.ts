import { describe, expect, it, vi } from 'vitest'

const addServerPlugin = vi.fn()
const addTemplate = vi.fn()

vi.mock('@nuxt/kit', () => ({
  addServerPlugin,
  addTemplate,
  createResolver: () => ({
    resolve: (path: string) => `/virtual/${path.replace('./', '')}`,
  }),
  defineNuxtModule: <T>(module: T) => module,
  useLogger: () => ({
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
  }),
}))

vi.mock('mongoose', () => ({
  default: {
    disconnect: vi.fn(),
  },
}))

vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))

vi.mock('./devtools', () => ({
  setupDevToolsUI: vi.fn(),
}))

describe('nuxt-mongoose aliases', () => {
  it('registers #nuxt/mongoose on Nuxt and Nitro aliases', async () => {
    const hooks: Record<string, ((arg: any) => void)[]> = {}

    const nuxt: any = {
      options: {
        alias: {} as Record<string, string>,
        buildDir: '/tmp/.nuxt',
        dev: false,
        devtools: false,
        runtimeConfig: {},
        serverDir: '/tmp/server',
      },
      hook: (name: string, callback: (arg: any) => void) => {
        hooks[name] = hooks[name] || []
        hooks[name].push(callback)
      },
    }

    const { default: module } = await import('./module')

    await (module as any).setup({
      devtools: true,
      modelsDir: 'models',
      options: {},
      uri: 'mongodb://localhost:27017/test',
    }, nuxt)

    expect(nuxt.options.alias['#nuxt/mongoose']).toBe('/virtual/runtime/server/services')

    const nitroConfig: any = { alias: {}, externals: {} }
    const onNitroConfig = hooks['nitro:config']?.[0]
    expect(onNitroConfig).toBeTypeOf('function')
    onNitroConfig!(nitroConfig)

    expect(nitroConfig.alias['#nuxt/mongoose']).toBe('/virtual/runtime/server/services')
  })
})
