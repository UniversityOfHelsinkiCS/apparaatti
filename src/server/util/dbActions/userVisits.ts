import { Op } from 'sequelize'

import type { UserVisit, VisitStudyData } from '../../../common/types.ts'
import UserVisits from '../../db/models/userVisits.ts'

export async function createUserVisitsEntry(visitorHashHex: string, date: Date, studyData: VisitStudyData) {
  // Normalize to UTC hour start
  const startHour = new Date(date)
  startHour.setUTCHours(startHour.getUTCHours(), 0, 0, 0)

  const entry: UserVisit = {
    visitorHashHex,
    date: startHour,
    ...studyData,
  }

  // findOrCreate to avoid duplicates when multiple requests arrive
  await UserVisits.findOrCreate({
    where: { visitorHashHex: entry.visitorHashHex, date: entry.date },
    defaults: entry,
  })
}

export async function getUserVisitsByUser(visitorHashHex: string, start: Date, end: Date) {
  const visits = await UserVisits.findAll({
    where: {
      visitorHashHex,
      date: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
    },
    raw: true,
  })

  return visits
}

// returns user visits in db grouped by the user
export async function getUserVisits(start: Date, end: Date) {
  const visits = await UserVisits.findAll({
    where: {
      date: {
        [Op.gte]: start,
        [Op.lt]: end,
      },
    },
    raw: true,
  })

  return visits
}

export async function getAllUserVisits(limit: number) {
  const visits = await UserVisits.findAll({
    order: [['date', 'DESC']],
    limit,
    raw: true,
  })

  return visits
}
