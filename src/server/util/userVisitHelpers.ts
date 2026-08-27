import type { LocalizedString, User, VisitStudyData } from '../../common/types.ts'
import {
  createUserVisitsEntry,
  getUserVisitsByUser,
  organisationsWithIds,
  studyRightsForPersonId,
} from './dbActions.ts'
import { localLog } from './dev.ts'
import { isAdmin, isSuperuser } from './validations.ts'

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

type EducationPhase = { code?: unknown; name?: unknown }

function programmeOf(phase: EducationPhase | null | undefined) {
  const code = typeof phase?.code === 'string' ? phase.code : null

  if (!code) {
    return { code: null, name: null }
  }

  const name = phase?.name && typeof phase.name === 'object' ? (phase.name as LocalizedString) : null
  return { code, name }
}

export async function getUserVisitStudyData(user: User): Promise<VisitStudyData> {
  const studyRights = await studyRightsForPersonId(user.id)

  const organisationId = studyRights.find(studyRight => studyRight.organisationId)?.organisationId
  const organisations = organisationId ? await organisationsWithIds([organisationId]) : []

  const phase1 = programmeOf(
    studyRights.find(studyRight => programmeOf(studyRight.educationPhase1).code)?.educationPhase1
  )
  const phase2 = programmeOf(
    studyRights.find(studyRight => programmeOf(studyRight.educationPhase2).code)?.educationPhase2
  )

  return {
    organisationCode: organisations[0]?.code ?? null,
    phase1ProgrammeCode: phase1.code,
    phase1ProgrammeName: phase1.name,
    phase2ProgrammeCode: phase2.code,
    phase2ProgrammeName: phase2.name,
  }
}

export async function saveUserVisitIfUnique(user: User) {
  if (isAdmin(user) || isSuperuser(user)) {
    localLog('admin or superuser, skipping', 'saveUserVisitIfUnique')
    return
  }

  const time = new Date()
  const visitorHashHex = await hashUser(user)
  localLog(time, 'saveUserVisitIfUnique')
  localLog(visitorHashHex, 'saveUserVisitIfUnique')

  const userVisits = await getUserVisitsAtHour(visitorHashHex, time)
  localLog(userVisits, 'saveUserVisitIfUnique')

  if (userVisits.length === 0) {
    localLog('created entry', 'saveUserVisitIfUnique')
    const studyData = await getUserVisitStudyData(user)
    await createUserVisitsEntry(visitorHashHex, time, studyData)
  } else {
    localLog('entry exists skipping', 'saveUserVisitIfUnique')
  }
}
