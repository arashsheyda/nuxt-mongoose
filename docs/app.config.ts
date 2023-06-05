export default defineAppConfig({
  docus: {
    title: 'Nuxt Mongoose',
    description: 'A Nuxt module for simplifying the use of Mongoose in your project.',
    image: 'https://user-images.githubusercontent.com/904724/185365452-87b7ca7b-6030-4813-a2db-5e65c785bf88.png',
    socials: {
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
      level: 0,
      collapsed: false,
      exclude: [],
    },
    main: {
      padded: true,
      fluid: true,
    },
    header: {
      logo: true,
      showLinkIcon: true,
      exclude: [],
      fluid: true,
    },
    footer: {
      fluid: true,
      iconLinks: [
        {
          href: 'https://nuxt.com',
          icon: 'simple-icons:nuxtdotjs',
        },
      ],
    },
  },
})
