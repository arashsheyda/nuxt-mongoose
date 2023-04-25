export interface ServerFunctions {
  // Database - collections
  readyState(): Promise<any>
  createCollection(name: string): Promise<any>
  listCollections(): Promise<any>
  getCollection(name: string): Promise<any>
  dropCollection(name: string): Promise<any>

  // Database - documents
  createDocument(collection: string, data: any): Promise<any>
  listDocuments(collection: string): Promise<any>
  getDocument(collection: string, id: string): Promise<any>
  updateDocument(collection: string, data: any): Promise<any>
  deleteDocument(collection: string, id: string): Promise<any>

  // Resource - api-routes & models
  generateResource(collection: Collection, resources: Resource[]): Promise<any>
  resourceSchema(collection: string): Promise<any>
}

export interface ClientFunctions {
  refresh(type: string): void
}

export interface Collection {
  name: string
  fields?: {}[]
}

export interface Resource {
  type: 'index' | 'create' | 'show' | 'put' | 'delete'
  by?: string
}
