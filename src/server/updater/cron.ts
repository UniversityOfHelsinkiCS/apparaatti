import cron from 'node-cron'

import { UPDATER_CRON_ENABLED, inProduction } from '../util/config.ts'
import { run, runDev } from './index.ts'

const setupCron = async () => {
  console.log('starting cron jobs')

  if (!inProduction) {
    await run(false)
  } else if (UPDATER_CRON_ENABLED) {
    await run(false)
    cron.schedule('15 3,15 * * *', run(true)) // Run updater every 12 hours
  }
}

export default setupCron
