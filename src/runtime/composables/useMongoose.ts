import type { mongo } from 'mongoose'
import { connection } from 'mongoose'

export function useMongoose(): { db: mongo.Db } {
  return {
    db: connection?.db,
  }
}
