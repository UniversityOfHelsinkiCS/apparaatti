import { defineConfig } from 'cypress'

export default defineConfig({
  experimentalStudio: true,
  chromeWebSecurity: false,
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log('[CYPRESS LOG]:', message)
          return null
        },
        error(message) {
          console.error('[CYPRESS ERROR]:', message)
          return null
        }
      })

      return config
    }
  }
})