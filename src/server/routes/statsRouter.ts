import express from 'express'
import { z } from 'zod'
import { getGroupLabel } from '../../common/datelabels.ts'
import { getUserVisits } from '../util/dbActions.ts'
import { enforceIsAdmin, enforceIsUser } from '../util/validations.ts'
import { localLog } from '../util/dev.ts'

const statsRouter = express.Router()

statsRouter.get('/', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const statsQuerySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
    groupBy: z.enum(['hour', 'day', 'month', 'year']).default('day')
  })

  const { start, end, groupBy } = statsQuerySchema.parse(req.query)
  const visits = await getUserVisits(new Date(start), new Date(end))
  localLog(visits, 'statsRouter')
  const counts = new Map<string, number>()

  for (const visit of visits) {
    const date = new Date(visit.date)
    if (Number.isNaN(date.getTime())) {
      continue
    }

    const label = getGroupLabel(date, groupBy)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  const result = Array.from(counts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({ label, count }))

  localLog(result, 'statsrouter')
  res.send(
    result
  )
})

export default statsRouter