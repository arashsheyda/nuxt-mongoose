import { logger } from '@nuxt/kit'
import mongoose from 'mongoose'
import type { NuxtDevtoolsServerContext, ServerFunctions } from '../types'

export function setupDatabaseRPC({ nuxt, options }: NuxtDevtoolsServerContext): any {
  mongoose.connect(options.uri, options.options)

  return {
    async createCollection(name: string) {
      return await mongoose.connection.db.createCollection(name)
    },
    async listCollections() {
      return await mongoose.connection.db.listCollections().toArray()
    },
    async getCollection(name: string) {
      return mongoose.connection.db.collection(name)
    },
    async dropCollection(name: string) {
      return await mongoose.connection.db.collection(name).drop()
    },

    async createDocument(collection: string, data: any) {
      return await mongoose.connection.db.collection(collection).insertOne(data)
    },
    async listDocuments(collection: string) {
      return await mongoose.connection.db.collection(collection).find().toArray()
    },
    async getDocument(collection: string, document: {}) {
      return await mongoose.connection.db.collection(collection).findOne({ document })
    },
    async updateDocument(collection: string, data: any) {
      const { _id, ...rest } = data
      try {
        return await mongoose.connection.db.collection(collection).findOneAndUpdate({ _id: new mongoose.Types.ObjectId(_id) }, { $set: rest })
      }
      catch (error) {
        logger.log(error)
        return error
      }
    },
    async deleteDocument(collection: string, id: string) {
      return await mongoose.connection.db.collection(collection).deleteOne({ _id: new mongoose.Types.ObjectId(id) })
    },
  } satisfies Partial<ServerFunctions>
}
