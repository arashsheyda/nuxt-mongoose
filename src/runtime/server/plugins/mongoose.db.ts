import { defineMongooseConnection } from '../services/mongoose'

export default defineNitroPlugin(() => {
  defineMongooseConnection()
})
