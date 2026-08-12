import type { User } from '../../common/types.ts'
import {
  createUserVisitsEntry,
  getUserVisitsByUser,
  organisationsWithIds,
  studyRightsForPersonId,
} from './dbActions.ts'
import { localLog } from './dev.ts'

//https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function hashUser(user: User): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(user.id)
  const hash = await crypto.subtle.digest('SHA-256', data)

  const hashArray = Array.from(new Uint8Array(hash))
  const hashHexString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHexString
}

//looks for visits done at time
//returns all visits of the hour so 10:02 and 10:10 returns the visits for hour 10
export async function getUserVisitsAtHour(visitorHashHex: string, date: Date) {
  const startHour = new Date(date)
  // Normalize to UTC hour boundaries to match stored UTC timestamps
  startHour.setUTCHours(startHour.getUTCHours(), 0, 0, 0)

  const endHour = new Date(startHour)
  endHour.setUTCHours(startHour.getUTCHours() + 1)

  const visits = await getUserVisitsByUser(visitorHashHex, startHour, endHour)
  return visits
}

//the organisation of the users most recently modified study right, null for users without one
export async function getUserOrganisationCode(user: User): Promise<string | null> {
  const studyRights = await studyRightsForPersonId(user.id)
  const organisationId = studyRights.find(studyRight => studyRight.organisationId)?.organisationId

  if (!organisationId) {
    return null
  }

  const organisations = await organisationsWithIds([organisationId])
  return organisations[0]?.code ?? null
}

export async function saveUserVisitIfUnique(user: User) {
  const time = new Date()
  const visitorHashHex = await hashUser(user)
  localLog(time, 'saveUserVisitIfUnique')
  localLog(visitorHashHex, 'saveUserVisitIfUnique')

  const userVisits = await getUserVisitsAtHour(visitorHashHex, time)
  localLog(userVisits, 'saveUserVisitIfUnique')

  if (userVisits.length === 0) {
    localLog('created entry', 'saveUserVisitIfUnique')
    const organisationCode = await getUserOrganisationCode(user)
    await createUserVisitsEntry(visitorHashHex, time, organisationCode)
  } else {
    localLog('entry exists skipping', 'saveUserVisitIfUnique')
  }
}
