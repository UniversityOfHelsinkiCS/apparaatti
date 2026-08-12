import express from 'express'
import { z } from 'zod'

import { getGroupLabel, getGroupLabels } from '../../common/datelabels.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import { getUserVisits } from '../util/dbActions.ts'
import { localLog } from '../util/dev.ts'

const statsRouter = express.Router()

statsRouter.use(requireAdmin)

type VisitorsPerOrganisation = Map<string | null, number>

const percentageOf = (part: number, total: number) => (total === 0 ? 0 : Number(((part / total) * 100).toFixed(1)))

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

  //set of visitorhashhex + label strings for dedublication
  const countedForLabel = new Set<string>()

  //label: the groupby parameter, hour, day .... in utc and the number of visits
  const counts = new Map<string, number>()

  //organisation counts
  /**
   * Map {
    '2026-08-11 13:00' => Map { 'H50' => 2, 'H40' => 1, null => 1 },
    '2026-08-11 14:00' => Map { 'H50' => 1, 'H40' => 1 },
  }
   */
  const organisationCounts = new Map<string, Map<string | null, number>>()

  //updating the counts
  for (const visit of visits) {
    const date = new Date(visit.date)
    if (Number.isNaN(date.getTime())) {
      continue
    }
    const label = getGroupLabel(date, groupBy)
    const key: string = visit.visitorHashHex + label

    if (!countedForLabel.has(key)) {
      counts.set(label, (counts.get(label) ?? 0) + 1)
      countedForLabel.add(key)

      const organisationCode = visit.organisationCode ?? null
      const forLabel = organisationCounts.get(label) ?? new Map<string | null, number>()
      forLabel.set(organisationCode, (forLabel.get(organisationCode) ?? 0) + 1)
      organisationCounts.set(label, forLabel)
    }
  }

  const result = getGroupLabels(start, end, groupBy).map(label => {
    const count = counts.get(label) ?? 0
    const visitorsPerOrganisation = organisationCounts.get(label) ?? new Map<string | null, number>()
    const organisations = organisationShares(visitorsPerOrganisation, count)

    return { label, count, organisations }
  })

  localLog(result, 'statsrouter')
  res.send(result)
})

export default statsRouter
