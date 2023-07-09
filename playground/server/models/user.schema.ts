import { defineMongooseModel } from '#nuxt/mongoose'

export const UserSchema = defineMongooseModel({
  name: 'User',
  schema: {
    name: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
      unique: false,
    },
    password: {
      type: 'string',
      required: true,
    },
  },
  hooks(schema) {
    schema.pre('save', function (this, next) {
      this.password = `hash.${this.password}.${Math.random()}`
      next()
    })
  },
})
