import type { Model, SchemaDefinition, SchemaOptions } from 'mongoose'
import mongoose from 'mongoose'

export function defineMongooseDiscriminatorModel<T>(
  nameOrOptions: string | {
    name: string
    baseModel: Model<T>
    schema: SchemaDefinition<T>
    options?: SchemaOptions
    hooks?: (schema: mongoose.Schema<T>) => void
  },
  baseModel?: Model<T>,
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
    baseModel = nameOrOptions.baseModel
    schema = nameOrOptions.schema
    options = nameOrOptions.options
    hooks = nameOrOptions.hooks
  }

  const newSchema = new mongoose.Schema<T>(schema, options as any)

  if (hooks) {
    hooks(newSchema)
  }

  return baseModel!.discriminator(name, newSchema) as Model<T>
}
