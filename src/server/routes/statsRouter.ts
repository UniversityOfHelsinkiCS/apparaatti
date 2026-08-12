import express from 'express'
import { z } from 'zod'

import { getGroupLabel, getGroupLabels } from '../../common/datelabels.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import { getUserVisits } from '../util/dbActions.ts'
import { localLog } from '../util/dev.ts'

const statsRouter = express.Router()

statsRouter.use(requireAdmin)

type VisitorsPerOrganisation = Map<string | null, number>

//visitorHashHex: the organisation of that visitor, null for visitors without one
type VisitorOrganisations = Map<string, string | null>

const percentageOf = (part: number, total: number) => (total === 0 ? 0 : Number(((part / total) * 100).toFixed(1)))

const visitorsPerOrganisation = (visitors: VisitorOrganisations) => {
  const counts: VisitorsPerOrganisation = new Map()

  for (const organisationCode of visitors.values()) {
    counts.set(organisationCode, (counts.get(organisationCode) ?? 0) + 1)
  }

  return counts
}

const organisationShares = (visitorsPerOrganisation: VisitorsPerOrganisation, total: number) => {
  const shares = Array.from(visitorsPerOrganisation.entries()).map(([organisationCode, visitors]) => ({
    organisationCode,
    count: visitors,
    percentage: percentageOf(visitors, total),
  }))

  return shares.sort((a, b) => b.count - a.count)
}

//Returns unique users grouped by 'hour', 'day', 'month', 'year'
statsRouter.get('/', async (req, res) => {
  const statsQuerySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
    groupBy: z.enum(['hour', 'day', 'month', 'year']).default('day'),
  })

  const { start, end, groupBy } = statsQuerySchema.parse(req.query)
  const visits = await getUserVisits(new Date(start), new Date(end))
  localLog(visits, 'statsRouter')

  //the organisation of every unique visitor per label
  //a visitor can have visits both with and without an organisation, the organisation wins
  /**
   * Map {
    '2026-08-11 13:00' => Map { 'a1b2..' => 'H50', 'c3d4..' => null },
    '2026-08-11 14:00' => Map { 'a1b2..' => 'H50' },
  }
   */
  const visitorsPerLabel = new Map<string, VisitorOrganisations>()

  //the same over the whole range instead of per label
  const visitorsInRange: VisitorOrganisations = new Map()

  for (const visit of visits) {
    const date = new Date(visit.date)
    if (Number.isNaN(date.getTime())) {
      continue
    }
    const label = getGroupLabel(date, groupBy)
    const organisationCode = visit.organisationCode ?? null

    if (visitorsInRange.get(visit.visitorHashHex) == null) {
      visitorsInRange.set(visit.visitorHashHex, organisationCode)
    }

    const visitors = visitorsPerLabel.get(label) ?? new Map<string, string | null>()
    if (visitors.get(visit.visitorHashHex) == null) {
      visitors.set(visit.visitorHashHex, organisationCode)
    }
    visitorsPerLabel.set(label, visitors)
  }

  const groups = getGroupLabels(start, end, groupBy).map(label => {
    const visitors = visitorsPerLabel.get(label) ?? new Map<string, string | null>()
    const organisations = organisationShares(visitorsPerOrganisation(visitors), visitors.size)

    return { label, count: visitors.size, organisations }
  })

  const total = {
    count: visitorsInRange.size,
    organisations: organisationShares(visitorsPerOrganisation(visitorsInRange), visitorsInRange.size),
  }

  const result = { groups, total }

  localLog(result, 'statsrouter')
  res.send(result)
})

export default statsRouter
