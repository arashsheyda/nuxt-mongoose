import { defineMongooseConnection } from '../services'

export default defineNitroPlugin(() => {
  defineMongooseConnection()
})
