export default defineAppConfig({
  docus: {
    title: 'Nuxt Mongoose',
    description: 'A Nuxt module for simplifying the use of Mongoose in your project.',
    image: '/cover.jpg',
    socials: {
      twitter: 'arash_sheyda',
      github: 'arashsheyda/nuxt-mongoose',
    },
    github: {
      dir: 'docs/content',
      branch: 'main',
      repo: 'nuxt-mongoose',
      owner: 'arashsheyda',
      edit: true,
    },
    aside: {
      level: 1,
      collapsed: false,
      exclude: [],
    },
    header: {
      logo: true,
      showLinkIcon: true,
      exclude: [],
    },
    footer: {
      iconLinks: [
        {
          href: 'https://nuxt.com',
          icon: 'simple-icons:nuxtdotjs',
        },
      ],
    },
  },
})
