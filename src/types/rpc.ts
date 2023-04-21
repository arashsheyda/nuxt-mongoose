export interface ServerFunctions {
  // collections
  createCollection(name: string): Promise<any>
  listCollections(): Promise<any>
  getCollection(name: string): Promise<any>
  dropCollection(name: string): Promise<any>

  // documents
  createDocument(collection: string, data: any): Promise<any>
  listDocuments(collection: string): Promise<any>
  getDocument(collection: string, id: string): Promise<any>
  updateDocument(collection: string, data: any): Promise<any>
  deleteDocument(collection: string, id: string): Promise<any>
}

export interface ClientFunctions {
  refresh(type: string): void
}
