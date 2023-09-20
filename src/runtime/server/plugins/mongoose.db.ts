/**
 * Due to an upstream bug in Nuxt 3 we need to stub the plugin here, track:https://github.com/nuxt/nuxt/issues/18556
 */
import type { NitroApp } from 'nitropack'
import { defineMongooseConnection } from '../services'

type NitroAppPlugin = (nitro: NitroApp) => void

function defineNitroPlugin(def: NitroAppPlugin): NitroAppPlugin {
  return def
}

export default defineNitroPlugin(() => {
  defineMongooseConnection()
})
