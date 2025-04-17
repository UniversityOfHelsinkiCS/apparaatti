import cron from 'node-cron'

import logger from './logger.ts'

import { UPDATER_CRON_ENABLED, inDevelopment } from '../../config'
import { run } from './index.ts'


const setupCron = async () => {
  logger.info('Starting cron jobs')

 
  if (inDevelopment) {
    await run()
  } else if (UPDATER_CRON_ENABLED) {
    cron.schedule('15 3,15 * * *', run) // Run updater every 12 hours
  }
}

export default setupCron
