import * as Sentry from '@sentry/node'

import type { UpdaterRun, UpdaterRunKind } from '../../common/types.ts'
import {
  createUpdaterRun,
  failInterruptedUpdaterRuns,
  finishUpdaterRun,
  getRunningUpdaterRun,
} from '../util/dbActions.ts'
import logger from '../util/logger.ts'
import { runWithClear } from './index.ts'

// Returns the newly created run row, or null if a run is already in progress.
// The updater executes asynchronously — the response is returned immediately.
export const triggerUpdaterRun = async (
  triggeredBy: string,
  runtype: UpdaterRunKind = 'full'
): Promise<UpdaterRun | null> => {
  if (await getRunningUpdaterRun()) {
    logger.info('[UPDATER] run cancelled due to a existing run operation')
    return null
  }

  const runRow = await createUpdaterRun(triggeredBy, runtype)

  // fire-and-forget: do not await
  runWithClear(true, runtype)
    .then(() => finishUpdaterRun(runRow.id, 'success'))
    .catch((e: unknown) => {
      const msg = e instanceof Error ? (e.stack ?? e.message) : String(e)
      Sentry.captureException(e, {
        tags: { component: 'updater', triggeredBy, runtype },
        extra: { updaterRunId: runRow.id },
      })
      logger.error(`[UPDATER] encountered and error ${msg}`)
      return finishUpdaterRun(runRow.id, 'failed', msg)
    })

  return runRow
}

export const clearInterruptedUpdaterRuns = async (): Promise<number> => {
  const cleared = await failInterruptedUpdaterRuns()
  if (cleared > 0) {
    logger.info(`[UPDATER] Marked ${cleared} interrupted run(s) as failed on startup`)
  }
  return cleared
}
