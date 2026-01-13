import * as redis from '../util/redis.ts'
import { fetchCoursesAndResponsibilities } from './courses.ts'
import fetchOrganisations from './organisations.ts'
import { fetchStudyRights } from './studyRights.ts'
import { fetchUsers } from './users.ts'
import { clearOffsets } from './util.ts'
import { fetchEnrolments } from './enrolments.ts'

const runUpdater = async () => {
  const phaseKey = 'apparaatti-updater-phase-offset'
  const phase = Number(await redis.get(phaseKey))

  if(phase < 1){
    await fetchOrganisations()
    await redis.set(phaseKey, phase + 1)
  }


  if(phase < 2){
    await fetchUsers()
    await redis.set(phaseKey, phase + 1)
  }

  if(phase < 3){
    await fetchCoursesAndResponsibilities()
    await redis.set(phaseKey, phase + 1)
  }


  if(phase < 4){
    await fetchStudyRights()
    await redis.set(phaseKey, phase + 1)
  }
 
  await redis.set(phaseKey, 0)
  await fetchEnrolments()
}

export const run = async (clear: boolean) => {
  try {
    if(clear){
      await clearOffsets()
    }
    await runUpdater()
  } catch (error) {
    return
  }
  return
}
