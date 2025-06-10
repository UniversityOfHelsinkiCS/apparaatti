import cron from 'node-cron'

import { UPDATER_CRON_ENABLED, inProduction } from '../util/config.ts'
import { run } from './index.ts'


const setupCron = async () => {
  console.log('starting cron jobs')
 
  if (!inProduction) {
    //await run() 
  } else if (UPDATER_CRON_ENABLED) {
    cron.schedule('15 3,15 * * *', run) // Run updater every 12 hours
  }
}

export default setupCron
