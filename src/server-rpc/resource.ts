import fs from 'fs-extra'
import { resolve } from 'pathe'
import mongoose from 'mongoose'
import type { Collection, NuxtDevtoolsServerContext, Resource, ServerFunctions } from '../types'
import { generateApiRoute, generateSchemaFile } from '../utils/schematics'
import { capitalize, pluralize, singularize } from '../utils/formatting'

export function setupResourceRPC({ nuxt }: NuxtDevtoolsServerContext): any {
  return {
    // TODO: maybe separate functions
    async generateResource(collection: Collection, resources: Resource[]) {
      const singular = singularize(collection.name).toLowerCase()
      const plural = pluralize(collection.name).toLowerCase()
      const dbName = capitalize(singular)

      if (collection.fields) {
        const schemaPath = resolve(nuxt.options.serverDir, 'utils/models', `${singular}.schema.ts`)
        if (!fs.existsSync(schemaPath)) {
          fs.ensureDirSync(resolve(nuxt.options.serverDir, 'utils/models'))
          fs.writeFileSync(schemaPath, generateSchemaFile(dbName, collection.fields))
        }

        const model = { name: dbName, path: `${singular}.schema` }

        // create resources
        const routeTypes = {
          index: 'index.get.ts',
          create: 'create.post.ts',
          show: (by: string) => `${by}.get.ts`,
          put: (by: string) => `${by}.put.ts`,
          delete: (by: string) => `${by}.delete.ts`,
        }
        resources.forEach((route: Resource) => {
          const fileName = typeof routeTypes[route.type] === 'function'
            ? (routeTypes[route.type] as any)(route.by)
            : routeTypes[route.type]

          const filePath = resolve(nuxt.options.serverDir, 'api', plural, fileName)
          if (!fs.existsSync(filePath)) {
            fs.ensureDirSync(resolve(nuxt.options.serverDir, `api/${plural}`))
            const content = generateApiRoute(route.type, { model, by: route.by })
            fs.writeFileSync(filePath, content)
          }
        })
      }

      // create collection if not exists
      if (!mongoose.connection.modelNames().includes(dbName))
        await mongoose.connection.db.createCollection(plural)
    },
    async resourceSchema(collection: string) {
      // TODO: use magicast
      const singular = singularize(collection).toLowerCase()
      const schemaPath = resolve(nuxt.options.serverDir, 'utils/models', `${singular}.schema.ts`)
      if (fs.existsSync(schemaPath)) {
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
