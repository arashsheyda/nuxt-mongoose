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
    async getCollectionSchema(collection: string) {
      try {
        const db = mongoose.connection.db
        if (!db) {
          return createError(new Error('Database not connected'))
        }

        // Sample multiple documents to get a better understanding of the schema
        const sampleSize = 10
        const documents = await db.collection(collection).find().limit(sampleSize).toArray()

        if (documents.length === 0) {
          return {}
        }

        // Aggregate field types from all sampled documents
        const schema: Record<string, { type: string, types: Set<string> }> = {}

        for (const doc of documents) {
          for (const [key, value] of Object.entries(doc)) {
            if (!schema[key]) {
              schema[key] = { type: '', types: new Set() }
            }

            const type = getValueType(value)
            schema[key].types.add(type)
          }
        }

        // Convert to final schema format
        const finalSchema: Record<string, { type: string }> = {}
        for (const [key, value] of Object.entries(schema)) {
          const types = Array.from(value.types)
          finalSchema[key] = {
            type: types.length === 1 ? types[0] : 'Mixed' as any,
          }
        }

        return finalSchema
      }
      catch (error) {
        return createError(error)
      }
    },
  } satisfies Partial<ServerFunctions>
}

function getValueType(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  const type = typeof value

  if (type === 'object') {
    // Check for BSON types first (these are the actual runtime objects)
    if (value._bsontype) {
      return value._bsontype
    }

    // Check for MongoDB extended JSON types (used in JSON representation)
    if ('$binary' in value) return 'Binary'
    if ('$timestamp' in value) return 'Timestamp'
    if ('$numberDecimal' in value) return 'Decimal128'
    if ('$numberDouble' in value) return 'Double'
    if ('$numberInt' in value) return 'Int32'
    if ('$numberLong' in value) return 'Long'
    if ('$oid' in value) return 'ObjectId'
    if ('$date' in value) return 'Date'
    if ('$regex' in value) return 'Regex'
    if ('$code' in value) return 'Code'
    if ('$minKey' in value) return 'MinKey'
    if ('$maxKey' in value) return 'MaxKey'
    if ('$undefined' in value) return 'Undefined'
    if ('$symbol' in value) return 'Symbol'

    // Check for JavaScript native types
    if (Array.isArray(value)) return 'Array'
    if (value instanceof Date) return 'Date'
    if (value instanceof mongoose.Types.ObjectId) return 'ObjectId'
    if (value instanceof RegExp) return 'Regex'

    return 'Object'
  }

  if (type === 'number') {
    return Number.isInteger(value) ? 'Number' : 'Number'
  }

  if (type === 'string') return 'String'
  if (type === 'boolean') return 'Boolean'

  return 'Mixed'
}

function createError(error: any): RPCError {
  return {
    error: {
      message: error?.message || 'An unknown error occurred',
      code: error?.code || 'UNKNOWN_ERROR',
    },
  }
}
