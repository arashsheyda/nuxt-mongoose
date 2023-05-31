import type { ConnectOptions } from 'mongoose'

export interface ModuleOptions {
  uri: string
  devtools: boolean
  options?: ConnectOptions
  modelsDir?: string
}
