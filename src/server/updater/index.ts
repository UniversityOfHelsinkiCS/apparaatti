
import { fetchCoursesAndResponsibilities } from './courses.ts'
import { fetchEnrolments } from './enrolments.ts'
import { fetchUsers } from './users.ts'
import { clearOffsets } from './util.ts'

const runUpdater = async () => {
//  await fetchUsers()
  await fetchCoursesAndResponsibilities()
//  await fetchEnrolments()
}

export const run = async () => {
  console.log('running updater')
  try {
    await clearOffsets()
    await runUpdater()
  } catch (error) {
    
    console.log(error)
    return
  }

  console.log('updater finished')
  return
}
