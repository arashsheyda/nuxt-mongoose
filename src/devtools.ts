import { existsSync } from 'node:fs'
import type { Nuxt } from 'nuxt/schema'
import type { Resolver } from '@nuxt/kit'
import { extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import type { ClientFunctions, ServerFunctions } from './types'
import type { ModuleOptions } from './module'
import { useViteWebSocket } from './utils'

import { setupRPC } from './rpc'
import { CLIENT_PATH, CLIENT_PORT, RPC_NAMESPACE } from './constants'

export function setupDevToolsUI(options: ModuleOptions, resolve: Resolver['resolve'], nuxt: Nuxt) {
  const clientPath = resolve('./client')
  const isProductionBuild = existsSync(clientPath)

  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r)
      server.middlewares.use(
        CLIENT_PATH,
        sirv(clientPath, { dev: true, single: true }),
      )
    })
  }
  else {
    nuxt.hook('vite:extendConfig', (config) => {
      config.server = config.server || {}
      config.server.proxy = config.server.proxy || {}
      config.server.proxy[CLIENT_PATH] = {
        target: `http://localhost:${CLIENT_PORT}${CLIENT_PATH}`,
        changeOrigin: true,
        followRedirects: true,
        rewrite: path => path.replace(CLIENT_PATH, ''),
      }
    })
  }

  nuxt.hook('devtools:customTabs', (tabs) => {
    tabs.push({
      name: 'nuxt-mongoose',
      title: 'Mongoose',
      icon: 'skill-icons:mongodb',
      view: {
        type: 'iframe',
        src: CLIENT_PATH,
      },
    })
  })

  const wsServer = useViteWebSocket(nuxt)
  onDevToolsInitialized(async () => {
    const rpcFunctions = setupRPC({ options, wsServer, nuxt })

    extendServerRpc<ClientFunctions, ServerFunctions>(RPC_NAMESPACE, rpcFunctions)
  })
}
