import { createUserVisitsEntry, getUserVisitsByUser } from './dbActions.ts'
import type { User } from '../../common/types.ts'

//https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function hashUser(user): Promise<string>{
  const encoder = new TextEncoder()
  const data = encoder.encode(user.id)
  const hash = await crypto.subtle.digest('SHA-256', data)

  const hashArray = Array.from(new Uint8Array(hash))
  const hashHexString = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return hashHexString

}

//looks for visits done at time
//returns all visits of the hour so 10:02 and 10:10 returns the visits for hour 10
export async function getUserVisitsAtHour(visitorHashHex: string, date: Date){
  const startHour = new Date(date)
  startHour.setMinutes(0, 0, 0)

  const endHour = new Date(startHour)
  endHour.setHours(startHour.getHours() + 1)

  const visits = await getUserVisitsByUser(visitorHashHex, startHour, endHour)
  return visits
}


export async function saveUserVisitIfUnique(user: User){
  
  const time = new Date()
  const visitorHashHex = await hashUser(user)
  const userVisits = await getUserVisitsAtHour(visitorHashHex, time)
  
  if(userVisits.length === 0){
    await createUserVisitsEntry(visitorHashHex, time)
  }
}

