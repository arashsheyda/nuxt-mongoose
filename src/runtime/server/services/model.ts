import type { Model, SchemaDefinition, SchemaOptions } from 'mongoose'
import mongoose from 'mongoose'

export function defineMongooseModel<T>(
  nameOrOptions: string | {
    name: string
    schema: SchemaDefinition<T>
    options?: SchemaOptions
    hooks?: (schema: mongoose.Schema<T>) => void
  },
  schema?: SchemaDefinition<T>,
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

  if (hooks) {
    hooks(newSchema)
  }

  return mongoose.model<T>(name, newSchema)
}
