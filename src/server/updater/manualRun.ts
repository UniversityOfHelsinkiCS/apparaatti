import { createUpdaterRun, finishUpdaterRun, getRunningUpdaterRun } from '../util/dbActions.ts'
import type { UpdaterRun } from '../../common/types.ts'
import { runWithClear } from './index.ts'

// Returns the newly created run row, or null if a run is already in progress.
// The updater executes asynchronously — the response is returned immediately.
//
// Note: a process restart while a run is in progress will leave a stale "running"
// row. This is acceptable for an admin-triggered operation.
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
