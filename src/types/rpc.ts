export interface ServerFunctions {
  listCollections(): Promise<any>
}

export interface ClientFunctions {
  refresh(type: string): void
}
