import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineMongooseConnection } from '#nuxt/mongoose/connection'

import { useRuntimeConfig } from 'nitropack/runtime'
import { consola } from 'consola'
import mongoose from 'mongoose'

// mocks
vi.mock('nitropack/runtime', () => ({ useRuntimeConfig: vi.fn() }))
vi.mock('mongoose', () => ({ default: { connect: vi.fn() } }))
vi.mock('colors', () => ({ default: { red: (msg: string) => msg } }))
vi.mock('consola', () => ({
  consola: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('defineMongooseConnection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('defineMongooseConnection using runtime config', async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      mongoose: {
        uri: 'mongodb://localhost:27017/test',
        options: { dbName: 'test' },
      },
    } as any)
    vi.mocked(mongoose.connect).mockResolvedValue({} as any)

    await defineMongooseConnection()

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/test',
      { dbName: 'test' },
    )
    expect(consola.success).toHaveBeenCalled()
  })
  it('defineMongooseConnection using uri', async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      mongoose: {
        uri: 'wrong-uri',
        options: { dbName: 'test' },
      },
    } as any)
    vi.mocked(mongoose.connect).mockResolvedValue({} as any)

    await defineMongooseConnection({ uri: 'mongodb://localhost:27017/test' })

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/test',
      { dbName: 'test' },
    )
    expect(consola.success).toHaveBeenCalled()
  })
  it('defineMongooseConnection skip if null uri', async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      mongoose: {
        uri: '',
        options: {},
      },
    } as any)

    await defineMongooseConnection()
    expect(mongoose.connect).not.toHaveBeenCalled()
    await defineMongooseConnection({ uri: '' })
    expect(mongoose.connect).not.toHaveBeenCalled()
    await defineMongooseConnection({ uri: '   ' })
    expect(mongoose.connect).not.toHaveBeenCalled()
  })
  it('defineMongooseConnection log error', async () => {
    vi.mocked(useRuntimeConfig).mockReturnValue({
      mongoose: {
        uri: 'mongodb://localhost:27017/test',
        options: { dbName: 'test' },
      },
    } as any)
    vi.mocked(mongoose.connect).mockRejectedValue(new Error('fail'))

    await defineMongooseConnection({ uri: 'mongodb://localhost:27017/test' })

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/test',
      { dbName: 'test' },
    )
    expect(consola.error).toHaveBeenCalled()
  })
})
