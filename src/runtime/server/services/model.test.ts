// test/defineMongooseModel.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import mongoose from 'mongoose'
import { defineMongooseModel } from '#nuxt/mongoose/model'

vi.mock('mongoose', () => {
  const actual = vi.importActual<typeof import('mongoose')>('mongoose')
  return {
    default: {
      ...actual,
      Schema: vi.fn().mockImplementation(function (this: any, schema: any, options: any) {
        this.schema = schema
        this.options = options
      }),
      model: vi.fn((name: string, schema: any) => ({ name, schema })),
    },
  }
})

describe('defineMongooseModel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates model name + schema', () => {
    const schemaDef = { name: String }
    const model = defineMongooseModel('User', schemaDef)

    expect(mongoose.Schema).toHaveBeenCalledWith(schemaDef, undefined)
    expect(mongoose.model).toHaveBeenCalled()
    expect(model.name).toBe('User')
    expect(model.schema.schema).toBe(schemaDef)
  })
  it('creates model name + schema + options + hooks', () => {
    const schemaDef = { name: String }
    const hooks = vi.fn()
    const model = defineMongooseModel({
      name: 'User',
      schema: schemaDef,
      options: { timestamps: true },
      hooks,
    })

    expect(mongoose.Schema).toHaveBeenCalledWith(schemaDef, { timestamps: true })
    expect(hooks).toHaveBeenCalled()
    expect(model.name).toBe('User')
  })
})
