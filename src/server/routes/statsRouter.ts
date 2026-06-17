import express from 'express'
import { z } from 'zod'

import { getGroupLabel } from '../../common/datelabels.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import { getUserVisits } from '../util/dbActions.ts'
import { localLog } from '../util/dev.ts'

const statsRouter = express.Router()

statsRouter.use(requireAdmin)

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
    }
  }

  const result = Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b)) //sorting time so that it goes from left -> right
    .map(([label, count]) => ({ label, count })) //now it is [{label: '', count: ''}]

  localLog(result, 'statsrouter')
  res.send(result)
})

export default statsRouter
