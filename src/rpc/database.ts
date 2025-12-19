import mongoose from 'mongoose'
import type { DevtoolsServerContext, ServerFunctions } from '../types'

// eslint-disable-next-line no-empty-pattern
export function setupDatabaseRPC({}: DevtoolsServerContext) {
  return {
    async readyState() {
      return mongoose.connection.readyState
    },
    async createCollection(name: string) {
      try {
        return await mongoose.connection.db?.createCollection(name)
      }
      catch (error) {
        return ErrorIT(error)
      }
    },
    async listCollections() {
      try {
        return await mongoose.connection.db?.listCollections().toArray()
      }
      catch (error) {
        return ErrorIT(error)
      }
    },
    async getCollection(name: string) {
      try {
        return await mongoose.connection.db?.collection(name).findOne()
      }
      catch (error) {
        return ErrorIT(error)
      }
    },
    async dropCollection(name: string) {
      try {
        return await mongoose.connection.db?.dropCollection(name)
      }
      catch (error) {
        return ErrorIT(error)
      }
    },

    async createDocument(collection: string, data: any) {
      const { _id, ...rest } = data
      try {
        return await mongoose.connection.db?.collection(collection).insertOne(rest)
      }
      catch (error: any) {
        return ErrorIT(error)
      }
    },
    async countDocuments(collection: string) {
      try {
        return await mongoose.connection.db?.collection(collection).countDocuments()
      }
      catch (error) {
        return ErrorIT(error)
      }
    },
    async listDocuments(collection: string, options: { page: number, limit: number } = { page: 1, limit: 10 }) {
      const skip = (options.page - 1) * options.limit
      const cursor = mongoose.connection.db?.collection(collection).find().skip(skip)
      if (options.limit !== 0)
        cursor?.limit(options.limit)
      return await cursor?.toArray()
    },
    async getDocument(collection: string, document: any) {
      try {
        return await mongoose.connection.db?.collection(collection).findOne({ document })
      }
      catch (error) {
        return ErrorIT(error)
      }
    },
    async updateDocument(collection: string, data: any) {
      const { _id, ...rest } = data
      try {
        return await mongoose.connection.db?.collection(collection).findOneAndUpdate({ _id: new mongoose.Types.ObjectId(_id) }, { $set: rest })
      }
      catch (error) {
        return ErrorIT(error)
      }
    },
    async deleteDocument(collection: string, id: string) {
      try {
        return await mongoose.connection.db?.collection(collection).deleteOne({ _id: new mongoose.Types.ObjectId(id) })
      }
      catch (error) {
        return ErrorIT(error)
      }
    },
  } satisfies Partial<ServerFunctions>
}

function ErrorIT(error: any) {
  return {
    error: {
      message: error?.message,
      code: error?.code,
    },
  }
}
