export default defineNuxtConfig({
  modules: ['../src/module'],

  mongoose: {
    uri: 'mongodb://127.0.0.1/nuxt-mongoose',
  },
})
