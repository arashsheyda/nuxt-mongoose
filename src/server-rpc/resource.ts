import fs from 'fs-extra'
import { resolve } from 'pathe'
import mongoose from 'mongoose'
import type { Collection, NuxtDevtoolsServerContext, Resource, ServerFunctions } from '../types'
import { generateApiRoute, generateSchemaFile } from '../utils/schematics'
import { capitalize, pluralize, singularize } from '../utils/formatting'

export function setupResourceRPC({ nuxt }: NuxtDevtoolsServerContext): any {
  return {
    async generateResource(collection: Collection, resources: Resource[]) {
      const singular = singularize(collection.name).toLowerCase()
      const plural = pluralize(collection.name).toLowerCase()
      const dbName = capitalize(singular)

      if (collection.fields) {
        if (!fs.existsSync(resolve(nuxt.options.serverDir, 'models', `${singular}.schema.ts`))) {
          fs.ensureDirSync(resolve(nuxt.options.serverDir, 'models'))
          fs.writeFileSync(
            resolve(nuxt.options.serverDir, 'models', `${singular}.schema.ts`),
            generateSchemaFile(dbName, collection.fields),
          )
        }

        const model = { name: dbName, path: `${singular}.schema` }
        fs.ensureDirSync(resolve(nuxt.options.serverDir, `api/${plural}`))

        // create resources
        // TODO: fix this
        resources.forEach((route: any) => {
          let fileName = ''
          if (route.type === 'index')
            fileName = 'index.get.ts'

          if (route.type === 'create')
            fileName = 'create.post.ts'

          if (route.type === 'show')
            fileName = `[_${route.by}].get.ts`.replace('_', '')

          if (route.type === 'put')
            fileName = `[_${route.by}].put.ts`.replace('_', '')

          if (route.type === 'delete')
            fileName = `[_${route.by}].delete.ts`.replace('_', '')

          if (!fs.existsSync(resolve(nuxt.options.serverDir, `api/${plural}`, fileName))) {
            const content = generateApiRoute(route.type, { model, by: route.by })
            fs.writeFileSync(resolve(nuxt.options.serverDir, 'api', plural, fileName), content)
          }
        })
      }

      // create collection if not exists
      if (!mongoose.connection.modelNames().includes(dbName))
        await mongoose.connection.db.createCollection(plural)

      // create rows and columns
    },
    async resourceSchema(collection: string) {
      // get schema file if exists
      const singular = singularize(collection).toLowerCase()

      if (fs.existsSync(resolve(nuxt.options.serverDir, 'models', `${singular}.schema.ts`))) {
        const schemaPath = resolve(nuxt.options.serverDir, 'models', `${singular}.schema.ts`)

        const content = fs.readFileSync(schemaPath, 'utf-8').match(/schema: \{(.|\n)*\}/g)

        if (content) {
          const schemaString = content[0].replace('schema: ', '').slice(0, -3)
          // eslint-disable-next-line no-eval
          const schema = eval(`(${schemaString})`)
          return schema
        }
      }
    },
  } satisfies Partial<ServerFunctions>
}
