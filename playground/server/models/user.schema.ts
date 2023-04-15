import { defineMongooseModel } from '#nuxt/mongoose'

export const User = defineMongooseModel({
  name: 'User',
  schema: {
    name: {
      type: String,
      required: true,
    },
  },
})

// export const User = defineMongooseModel('User', {
//   name: {
//     type: String,
//     required: true,
//   },
// })
