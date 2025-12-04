import { fetchCoursesAndResponsibilities } from './courses.ts'
import fetchOrganisations from './organisations.ts'
import { fetchStudyRights } from './studyRights.ts'
import { fetchUsers } from './users.ts'
import { clearOffsets } from './util.ts'

const runUpdater = async () => {
  console.log('organisations')
  await fetchOrganisations()
  console.log('users')
  await fetchUsers()
  console.log('courses and responsibilities')
  await fetchCoursesAndResponsibilities()
  console.log('studyrights')
  await fetchStudyRights()
 
  //  await fetchEnrolments()
}

export const run = async (clear: boolean) => {
  console.log('running updater')
  try {
    if(clear){
      await clearOffsets()
    }
    await runUpdater()
  } catch (error) {
    console.log(error)
    return
  }

  console.log('updater finished')
  return
}
