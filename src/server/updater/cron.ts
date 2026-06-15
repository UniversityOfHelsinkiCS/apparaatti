import cron from 'node-cron'

import { UPDATER_CRON_ENABLED, inProduction } from '../util/config.ts'
import { run } from './index.ts'
import { createUpdaterRun, finishUpdaterRun } from '../util/dbActions.ts'

const runTracked = async () => {
  const runRow = await createUpdaterRun('cron')
  try {
    await run(true)
    await finishUpdaterRun(runRow.id, 'success')
  } catch (e: unknown) {
    const msg = e instanceof Error ? (e.stack ?? e.message) : String(e)
    await finishUpdaterRun(runRow.id, 'failed', msg)
  }
}

const setupCron = async () => {
  if (!inProduction) {
    // await runTracked()
  } else if (UPDATER_CRON_ENABLED) {
    // await runTracked()
    cron.schedule('0 3 * * 0', () => runTracked()) // Run updater once a week on Sunday at 3:00 AM
  }
}

export default setupCron
