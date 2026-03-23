import { defineNitroPlugin } from 'nitropack/runtime'
import { defineMongooseConnection } from '../services'

export default defineNitroPlugin(() => {
  defineMongooseConnection()
})
