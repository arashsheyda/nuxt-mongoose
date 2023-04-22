import { capitalize } from './formatting'

export function generateSchemaFile(name: string, fields: any) {
  name = capitalize(name)
  // TODO: fix spacing
  const outputObject = JSON.stringify(
    fields.reduce((acc: any, curr: any) => {
      const { name, ...rest } = curr
      acc[name] = rest
      return acc
    }, {}),
    null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"(\w+)":/g, '$1:')
    .replace(/\s*"\w+":/g, match => match.trim())
    .replace(/"string"/g, '\'string\'')

  return `import { defineMongooseModel } from '#nuxt/mongoose'

export const ${name}Schema = defineMongooseModel({
  name: '${name}',
  schema: ${outputObject},
})
`
}

export function generateApiRoute(action: string, { model, by }: { model: { name: string; path: string }; by?: string }) {
  const modelName = capitalize(model.name)
  const schemaImport = `import { ${modelName}Schema } from '../../models/${model.path}'\n\n`
  const operation = {
    index: `return await ${modelName}Schema.find({})`,
    create: `return await new ${modelName}Schema(body).save()`,
    show: `return await ${modelName}Schema.findOne({ ${by}: event.context.params?.${by} })`,
    put: `return await ${modelName}Schema.findOneAndUpdate({ ${by}: event.context.params?.${by} }, body, { new: true })`,
    delete: `return await ${modelName}Schema.findOneAndDelete({ ${by}: event.context.params?.${by} })`,
  }[action]

  const main = `try {
    ${operation}
  }
  catch (error) {
    return error
  }`

  return `${schemaImport}export default defineEventHandler(async (event) => {
  ${(action === 'create' || action === 'put') ? `const body = await readBody(event)\n  ${main}` : main}
})
`
}
