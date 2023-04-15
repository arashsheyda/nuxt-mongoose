import type { ConnectOptions, Model, SchemaDefinition, SchemaOptions } from 'mongoose'
import { Schema, connect, model } from 'mongoose'
import { logger } from '@nuxt/kit'

import { useRuntimeConfig } from '#imports'

export async function defineMongooseConnection({ uri, options }: { uri?: string; options?: ConnectOptions } = {}): Promise<void> {
  const config = useRuntimeConfig().public.mongoose
  const mongooseUri = uri || config.uri
  const mongooseOptions = options || config.options

  try {
    await connect(mongooseUri, { ...mongooseOptions })
    logger.info('Connected to database')
  }
  catch (err) {
    logger.error('Error connecting to database', err)
  }
}

export function defineMongooseModel(nameOrOptions: string | { name: string; schema: SchemaDefinition; options?: SchemaOptions }, schema?: SchemaDefinition, options?: SchemaOptions): Model<any> {
  let name: string
  if (typeof nameOrOptions === 'string') {
    name = nameOrOptions
  }
  else {
    name = nameOrOptions.name
    schema = nameOrOptions.schema
    options = nameOrOptions.options
  }

  const newSchema = new Schema({
    ...schema,
  }, { ...options })
  return model(name, newSchema)
}
