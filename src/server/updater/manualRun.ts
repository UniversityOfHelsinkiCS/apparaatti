import type { UpdaterRun } from '../../common/types.ts'
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
export const triggerUpdaterRun = async (triggeredBy: string): Promise<UpdaterRun | null> => {
  if (await getRunningUpdaterRun()) return null

  const runRow = await createUpdaterRun(triggeredBy)

  // fire-and-forget: do not await
  runWithClear(true)
    .then(() => finishUpdaterRun(runRow.id, 'success'))
    .catch((e: unknown) => {
      const msg = e instanceof Error ? (e.stack ?? e.message) : String(e)
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
