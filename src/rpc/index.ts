import mongoose from 'mongoose'
import type { DevtoolsServerContext, ServerFunctions } from '../types'

import { setupDatabaseRPC } from './database'
import { setupResourceRPC } from './resource'

export function setupRPC(ctx: DevtoolsServerContext): ServerFunctions {
  mongoose.connect(ctx.options.uri, ctx.options.options)

  return {
    getOptions() {
      return ctx.options
    },

    ...setupDatabaseRPC(ctx),
    ...setupResourceRPC(ctx),

    async reset() {
      const ws = await ctx.wsServer
      ws.send('nuxt-mongoose:reset')
    },
  }
}
