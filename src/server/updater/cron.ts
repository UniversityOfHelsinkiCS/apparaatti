import cron from 'node-cron'

import { inProduction, UPDATER_CRON_ENABLED } from '../util/config.ts'
import { triggerUpdaterRun } from './manualRun.ts'

const setupCron = async () => {
  if (!inProduction) {
    // await triggerUpdaterRun('cron')
  } else if (UPDATER_CRON_ENABLED) {
    // await triggerUpdaterRun('cron')
    cron.schedule('0 3 * * 0', () => void triggerUpdaterRun('cron')) // Run updater once a week on Sunday at 3:00 AM
  }
}

export default setupCron
