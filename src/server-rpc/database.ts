import { logger } from '@nuxt/kit'
import { ObjectId } from 'mongodb'
import { connection as MongooseConnection, connect } from 'mongoose'
import type { NuxtDevtoolsServerContext, ServerFunctions } from '../types'

export function setupDatabaseRPC({ nuxt }: NuxtDevtoolsServerContext): any {
  // TODO:
  connect('mongodb://127.0.0.1:27017/arcane')

  return {
    async createCollection(name: string) {
      return await MongooseConnection.db.createCollection(name)
    },
    async listCollections() {
      return await MongooseConnection.db.listCollections().toArray()
    },
    async getCollection(name: string) {
      return MongooseConnection.db.collection(name)
    },
    async dropCollection(name: string) {
      return await MongooseConnection.db.collection(name).drop()
    },

    async createDocument(collection: string, data: any) {
      return await MongooseConnection.db.collection(collection).insertOne(data)
    },
    async listDocuments(collection: string) {
      return await MongooseConnection.db.collection(collection).find().toArray()
    },
    async getDocument(collection: string, document: {}) {
      return await MongooseConnection.db.collection(collection).findOne({ document })
    },
    async updateDocument(collection: string, data: any) {
      const { _id, ...rest } = data
      try {
        return await MongooseConnection.db.collection(collection).findOneAndUpdate({ _id: new ObjectId(_id) }, { $set: rest })
      }
      catch (error) {
        logger.log(error)
        return error
      }
    },
    async deleteDocument(collection: string, id: string) {
      return await MongooseConnection.db.collection(collection).deleteOne({ _id: new ObjectId(id) })
    },
  } satisfies Partial<ServerFunctions>
}
