
import { fetchCoursesAndResponsibilities } from './courses'
import { fetchEnrolments } from './enrolments'
import { fetchUsers } from './users'
import { clearOffsets } from './util'

const runUpdater = async () => {
  await fetchUsers()
  await fetchCoursesAndResponsibilities()
  await fetchEnrolments()
}

export const run = async () => {
  console.log("running updater")
  try {
    await clearOffsets()
    await runUpdater()
  } catch (error) {
    
    console.log(error)
    return
  }

  console.log("updater finished")
  return
}
