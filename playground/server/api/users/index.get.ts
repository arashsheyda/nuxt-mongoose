export default defineEventHandler(async () => {
  try {
    return await UserSchema.find({})
  }
  catch (error) {
    return error
  }
})
