import { logger } from '@nuxt/kit'
import { $fetch } from 'ofetch'
import { version } from '../../package.json'

async function checkForNewVersion() {
  try {
    const release = await $fetch(
      'https://registry.npmjs.org/nuxt-mongoose/latest',
    )

    if (release.version > version) {
      logger.info(
          `A new version of Nuxt Mongoose (v${release.version}) is available: https://github.com/arashsheyda/nuxt-mongoose/releases/latest`,
      )
    }
  }
  catch (error) {
    logger.warn('Checking for \'nuxt-mongoose\' latest version failed')
  }
}

export { checkForNewVersion }
