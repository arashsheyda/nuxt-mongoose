import { logger } from '@nuxt/kit'
import mongoose from 'mongoose'
import type { ConnectOptions, Model, SchemaDefinition, SchemaOptions } from 'mongoose'

import { useRuntimeConfig } from '#imports'

export async function defineMongooseConnection({ uri, options }: { uri?: string; options?: ConnectOptions } = {}): Promise<void> {
  // TODO: types
  const config = useRuntimeConfig().mongoose
  const mongooseUri = uri || config.uri
  const mongooseOptions = options || config.options

  try {
    await mongoose.connect(mongooseUri, { ...mongooseOptions })
    logger.success('Connected to `MongoDB`')
  }
  catch (err) {
    logger.error('Error connecting to `MongoDB`', err)
  }
}

export function defineMongooseModel<T>(
  nameOrOptions: string | {
    name: string
    schema: SchemaDefinition
    options?: SchemaOptions
    hooks?: (schema: mongoose.Schema<T>) => void
  },
  schema?: SchemaDefinition,
  options?: SchemaOptions,
  hooks?: (schema: mongoose.Schema<T>) => void,
): Model<T> {
  let name: string
  if (typeof nameOrOptions === 'string') {
    name = nameOrOptions
  }
  else {
    name = nameOrOptions.name
    schema = nameOrOptions.schema
    options = nameOrOptions.options
    hooks = nameOrOptions.hooks
  }

  const newSchema = new mongoose.Schema<T>(schema, options as any)

  if (hooks)
    hooks(newSchema)

  return mongoose.model<T>(name, newSchema)
}
