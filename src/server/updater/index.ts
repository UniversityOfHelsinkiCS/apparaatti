import * as redis from '../util/redis.ts'
import { fetchCoursesAndResponsibilities } from './courses.ts'
import fetchOrganisations from './organisations.ts'
import { fetchStudyRights } from './studyRights.ts'
import { fetchUsers } from './users.ts'
import { clearOffsets } from './util.ts'
import { fetchEnrolments } from './enrolments.ts'

const runUpdater = async () => {

  try{
    await fetchOrganisations()

    await fetchUsers()

    await fetchCoursesAndResponsibilities()


    await fetchStudyRights()

  }catch(e){
    console.log('error on updater exiting!')
    console.log(e)
  }
 
}

export const run = async (clear: boolean) => {
  try {
    if(clear){
      await clearOffsets()
    }
    await runUpdater()
  } catch (_error) {
    console.log(_error)
    return
  }
  return
}
