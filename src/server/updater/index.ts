
import { fetchCoursesAndResponsibilities } from './courses.ts'
import { fetchEnrolments } from './enrolments.ts'
import fetchOrganisations from './organisations.ts'
import { fetchStudyRights } from './studyRights.ts'
import { fetchUsers } from './users.ts'
import { clearOffsets } from './util.ts'

const runUpdater = async () => {
  await fetchUsers()
  await fetchCoursesAndResponsibilities()
  await fetchStudyRights()
  await fetchOrganisations()
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


export const runDev = async () => {
  console.log('running development updater')
  try {
    await clearOffsets()
   
    //await fetchUsers()
    //await fetchCoursesAndResponsibilities()
    //await fetchStudyRights()
    await fetchOrganisations()

  } catch (error) {
    
    console.log(error)
    return
  }

  console.log('updater finished')
  return
}
