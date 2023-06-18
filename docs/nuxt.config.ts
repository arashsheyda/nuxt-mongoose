export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',

  app: {
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/mongoose-icon.svg',
        },
      ],
    },
  },

  modules: [
    '@nuxthq/studio',
  ],
})
