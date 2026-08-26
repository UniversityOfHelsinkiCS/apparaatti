import * as Sentry from '@sentry/node'

import type { UpdaterRunKind } from '../../common/types.ts'
import logger from '../util/logger.ts'
import { fetchCoursesAndResponsibilities } from './courses.ts'
import fetchOrganisations from './organisations.ts'
import { fetchStudyRights } from './studyRights.ts'
import { fetchUsers } from './users.ts'
import { clearOffsets } from './util.ts'

const runUpdater = async (runtype: UpdaterRunKind) => {
  try {
    await fetchCoursesAndResponsibilities()
    if (runtype === 'courses') return
    await fetchUsers()
    await fetchOrganisations()
    await fetchStudyRights()
  } catch (e) {
    const msg = e instanceof Error ? (e.stack ?? e.message) : String(e)
    logger.error(`UPDATER encountered an error: ${msg}`)
    Sentry.captureException(e, {
      tags: { component: 'updater' },
    })
    throw e
  }
}

// Throws on failure — use this when you want to handle errors yourself
export const runWithClear = async (clear: boolean, runtype: UpdaterRunKind = 'full') => {
  if (clear) {
    await clearOffsets(runtype === 'courses' ? 'courses-offset' : '*-offset')
  }
  await runUpdater(runtype)
}

// Cron-safe wrapper that swallows errors
export const run = async (clear: boolean, runtype: UpdaterRunKind = 'full') => {
  try {
    await runWithClear(clear, runtype)
  } catch (error) {
    console.log(error)
  }
}
