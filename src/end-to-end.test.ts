import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { resolve } from 'pathe'
import { MongoMemoryServer } from 'mongodb-memory-server'

if (process.env.RUN_E2E_TESTS === 'true') {
  const mongodb = await MongoMemoryServer.create()
  await setup({
    rootDir: resolve(__dirname, '../playground'),
    server: true, // start Nuxt/Nitro serveur fetch /api/..
    dev: false, // build prod-like
    nuxtConfig: {
      ssr: false,
      pages: false,
      mongoose: { uri: mongodb.getUri() },
    },
  })
}

describe.runIf(process.env.RUN_E2E_TESTS === 'true')('Nuxt server module E2E', () => {
  it('GET /api/hi returns { message: "hi" }', async () => {
    expect(await $fetch('/api/hi')).toEqual({ message: 'hi' })
  })
  describe('CRUD on users', () => {
    let userId: string
    it('C: POST /api/users -> create user', async () => {
      const res = await $fetch('/api/users/create', {
        method: 'POST',
        body: {
          name: 'Alice',
          email: 'alice@example.com',
          password: 'password',
        },
      })
      expect(res).toMatchObject({
        _id: expect.any(String),
        email: 'alice@example.com',
        name: 'Alice',
        password: expect.any(String),
      })
      userId = (res as any)._id
    })
    it('R GET /api/users -> list users', async () => {
      expect(await $fetch('/api/users')).toMatchObject([
        {
          _id: expect.any(String),
          email: 'alice@example.com',
          name: 'Alice',
          password: expect.any(String),
        },
      ])
    })
    it('R GET /api/users/:id -> user', async () => {
      expect(await $fetch(`/api/users/${userId}`)).toMatchObject({
        _id: expect.any(String),
        email: 'alice@example.com',
        name: 'Alice',
        password: expect.any(String),
      })
    })
    it('U: PUT /api/users/:id -> update user', async () => {
      const res = await $fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: { name: 'Alice Updated' },
      })
      expect(res).toMatchObject({
        _id: expect.any(String),
        email: 'alice@example.com',
        name: 'Alice Updated',
        password: expect.any(String),
      })
    })
    it('D: DELETE /api/users/:id -> delete user', async () => {
      const res = await $fetch(`/api/users/${userId}`, { method: 'DELETE' })
      expect(res).toMatchObject({
        _id: expect.any(String),
        email: 'alice@example.com',
        name: 'Alice Updated',
        password: expect.any(String),
      })

      expect(((await $fetch('/api/users')) as any).length).toBe(0)
    })
  })
})
