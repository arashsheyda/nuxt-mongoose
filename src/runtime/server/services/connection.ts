import type { ConnectOptions } from 'mongoose'
import { logger } from '@nuxt/kit'
import mongoose from 'mongoose'

// @ts-ignore
import { useRuntimeConfig } from '#imports'

export async function defineMongooseConnection({ uri, options }: { uri?: string; options?: ConnectOptions } = {}): Promise<void> {
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
