import { fetchCoursesAndResponsibilities } from './courses.ts'
import fetchOrganisations from './organisations.ts'
import { fetchStudyRights } from './studyRights.ts'
import { fetchUsers } from './users.ts'
import { clearOffsets } from './util.ts'

const runUpdater = async () => {
  await fetchCoursesAndResponsibilities()
  await fetchUsers()
  await fetchOrganisations()
  await fetchStudyRights()
}

// Throws on failure — use this when you want to handle errors yourself
export const runWithClear = async (clear: boolean) => {
  if (clear) {
    await clearOffsets()
  }
  await runUpdater()
}

// Cron-safe wrapper that swallows errors
export const run = async (clear: boolean) => {
  try {
    await runWithClear(clear)
  } catch (error) {
    console.log(error)
  }
}
