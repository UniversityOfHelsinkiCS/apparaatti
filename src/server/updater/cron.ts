import cron from 'node-cron'

import { UPDATER_CRON_ENABLED, inProduction } from '../util/config.ts'
import { run } from './index.ts'

const setupCron = async () => {

  if (!inProduction) {
    await run(true)
  } else if (UPDATER_CRON_ENABLED) {
    await run(true)
    // cron.schedule('15 3,15 * * *', run(true)) // Run updater every 12 hours
  }
}

export default setupCron
