import type { ConnectOptions } from 'mongoose'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import mongoose from 'mongoose'

// @ts-ignore
import { useRuntimeConfig } from '#imports'

export async function defineMongooseConnection({ uri, options }: { uri?: string; options?: ConnectOptions } = {}): Promise<void> {
  const config = useRuntimeConfig().mongoose
  const mongooseUri = uri || config.uri
  if (!(mongooseUri as string).trim()) return
  const mongooseOptions = options || config.options

  try {
    await mongoose.connect(mongooseUri, { ...mongooseOptions })
    consola.success('Connected to MongoDB')
  }
  catch (err) {
    consola.error(colors.red(`Error connecting to MongoDB: ${err}`))
  }
}
