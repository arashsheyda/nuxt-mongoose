import type { WebSocketServer } from 'vite'
import type { Nuxt } from 'nuxt/schema'
import plrz from 'pluralize'

export function useViteWebSocket(nuxt: Nuxt) {
  return new Promise<WebSocketServer>((_resolve) => {
    nuxt.hooks.hook('vite:serverCreated', (viteServer) => {
      _resolve(viteServer.ws)
    })
  })
}

export function normalizeToKebabOrSnakeCase(str: string) {
  const STRING_DASHERIZE_REGEXP = /\s/g
  const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g
  return str
    .replace(STRING_DECAMELIZE_REGEXP, '$1-$2')
    .toLowerCase()
    .replace(STRING_DASHERIZE_REGEXP, '-')
}

export function pluralize(str: string) {
  return plrz.plural(str)
}

export function singularize(str: string) {
  return plrz.singular(str)
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

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

export function generateApiRoute(action: string, { model, by }: { model: { name: string, path: string }, by?: string }) {
  const modelName = capitalize(model.name)
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

  return `export default defineEventHandler(async (event) => {
  ${(action === 'create' || action === 'put') ? `const body = await readBody(event)\n  ${main}` : main}
})
`
}
