import { User } from '~/server/models/user.schema'

export default defineEventHandler(() => {
  return User.find()
})
