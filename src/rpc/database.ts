import type { DevtoolsServerContext, RPCError, ServerFunctions } from '../types'
import mongoose from 'mongoose'
import type { Document } from 'mongodb'

// eslint-disable-next-line no-empty-pattern
export function setupDatabaseRPC({}: DevtoolsServerContext) {
  return {
    async connectionInfo() {
      const conn = mongoose.connection
      const client = conn.getClient?.()

      return {
        connectionState: conn.readyState,
        authenticated: !!conn.user,

        name: mongoose.connection.name,
        host: mongoose.connection.host,

        mongooseVersion: mongoose.version,
        driverVersion: client?.options?.driverInfo?.version,

        timestamps: {
          now: Date.now(),
        },
      }
    },
    async createCollection(name: string) {
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }
        return await db.createCollection(name)
      }
      catch (error) {
        return createError(error)
      }
    },
    async listCollections() {
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }
        return await db.listCollections().toArray()
      }
      catch (error) {
        return createError(error)
      }
    },
    async getCollection(name: string) {
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }
        return await db.collection(name).findOne()
      }
      catch (error) {
        return createError(error)
      }
    },
    async dropCollection(name: string) {
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }
        return await db.dropCollection(name)
      }
      catch (error) {
        return createError(error)
      }
    },

    async createDocument(collection: string, data: any) {
      const { _id, ...rest } = data
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }
        return await db.collection(collection).insertOne(rest)
      }
      catch (error: any) {
        return createError(error)
      }
    },
    async countDocuments(collection: string) {
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }
        return await db.collection(collection).countDocuments()
      }
      catch (error) {
        return createError(error)
      }
    },
    async listDocuments(collection: string, options: { page: number, limit: number } = { page: 1, limit: 10 }) {
      const skip = (options.page - 1) * options.limit
      const db = mongoose.connection.db
      if (!db) {
        return createError(new Error('Database not connected'))
      }
      const cursor = db.collection(collection).find().skip(skip)
      if (options.limit !== 0)
        cursor.limit(options.limit)
      return await cursor.toArray()
    },
    async getDocument(collection: string, id: string) {
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }
        return await db.collection(collection).findOne({ _id: new mongoose.Types.ObjectId(id) })
      }
      catch (error) {
        return createError(error)
      }
    },
    async updateDocument(collection: string, data: { _id: string } & Document) {
      const { _id, ...rest } = data
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }
        return await db.collection(collection).updateOne({ _id: new mongoose.Types.ObjectId(_id) }, { $set: rest })
      }
      catch (error) {
        return createError(error)
      }
    },
    async deleteDocument(collection: string, id: string) {
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }
        return await db.collection(collection).deleteOne({ _id: new mongoose.Types.ObjectId(id) })
      }
      catch (error) {
        return createError(error)
      }
    },
  } satisfies Partial<ServerFunctions>
}

function createError(error: any): RPCError {
  return {
    error: {
      message: error?.message || 'An unknown error occurred',
      code: error?.code || 'UNKNOWN_ERROR',
    },
  }
}
