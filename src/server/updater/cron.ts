import cron from 'node-cron'

import { UPDATER_CRON_ENABLED, inProduction } from '../util/config.ts'
import { run } from './index.ts'

const setupCron = async () => {

  if (!inProduction) {
    // await run(true)
  } else if (UPDATER_CRON_ENABLED) {
    // await run(true)
    cron.schedule('0 3 * * 0', () => run(true)) // Run updater once a week on Sunday at 3:00 AM
  }
}

export default setupCron
