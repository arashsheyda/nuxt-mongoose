import type { Nuxt } from 'nuxt/schema'
import type { WebSocketServer } from 'vite'
import type { ModuleOptions } from '../module'
import type { ConnectionStates } from 'mongoose'
import type {
  Collection as MCollection,
  Document,
  WithId,
  InsertOneResult,
  DeleteResult,
  UpdateResult,
} from 'mongodb'

export interface ServerFunctions {
  getOptions(): ModuleOptions

  connectionInfo(): Promise<DatabaseConnectionInfo>

  // Database - collections
  createCollection(name: string): Promise<RPCResult<MCollection<Document>>>
  listCollections(): Promise<RPCResult<Array<Document>>>
  getCollection(name: string): Promise<RPCResult<WithId<Document> | null>>
  dropCollection(name: string): Promise<RPCResult<boolean>>

  // Database - documents
  createDocument(collection: string, data: Document): Promise<RPCResult<InsertOneResult<Document>>>
  countDocuments(collection: string): Promise<RPCResult<number>>
  listDocuments(collection: string, options: PaginationOptions): Promise<RPCResult<Array<WithId<Document>>>>
  getDocument(collection: string, id: string): Promise<RPCResult<WithId<Document> | null>>
  updateDocument(collection: string, data: { _id: string } & Document): Promise<RPCResult<UpdateResult>>
  deleteDocument(collection: string, id: string): Promise<RPCResult<DeleteResult>>

  // Resource - api-routes & models
  generateResource(collection: MCollection, resources: Resource[]): Promise<any>
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

export interface DatabaseConnectionInfo {
  connectionState: ConnectionStates

  name?: string
  host?: string
  hosts?: string[]

  authenticated: boolean

  mongooseVersion: string
  driverVersion?: string

  timestamps: {
    now: number
    connectedAt?: number
  }
}

export interface RPCError {
  error: {
    message?: string
    code?: number | string
  }
}

export interface PaginationOptions {
  page: number
  limit: number
}

export type RPCResult<T> = T | RPCError
