import type { Nuxt } from 'nuxt/schema'
import type { WebSocketServer } from 'vite'
import type { ModuleOptions } from '../module'

export interface ServerFunctions {
  getOptions(): ModuleOptions

  // Database - collections
  readyState(): Promise<any>
  createCollection(name: string): Promise<any>
  listCollections(): Promise<any>
  getCollection(name: string): Promise<any>
  dropCollection(name: string): Promise<any>

  // Database - documents
  createDocument(collection: string, data: any): Promise<any>
  countDocuments(collection: string): Promise<any>
  listDocuments(collection: string, options: any): Promise<any>
  getDocument(collection: string, id: string): Promise<any>
  updateDocument(collection: string, data: any): Promise<any>
  deleteDocument(collection: string, id: string): Promise<any>

  // Resource - api-routes & models
  generateResource(collection: Collection, resources: Resource[]): Promise<any>
  resourceSchema(collection: string): Promise<any>

  reset(): void
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ClientFunctions {
}

export interface DevtoolsServerContext {
  nuxt: Nuxt
  options: ModuleOptions
  wsServer: Promise<WebSocketServer>
}

export interface Collection {
  name: string
  fields?: object[]
}

export interface Resource {
  type: 'index' | 'create' | 'show' | 'put' | 'delete'
  by?: string
}
