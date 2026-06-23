import axios from 'axios'
import express from 'express'
import { z } from 'zod'

import type { UniqueUrnResponse } from '../../common/types.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import requireSuperuser from '../middleware/requireSuperuser.ts'
import requireUser from '../middleware/requireUser.ts'
import {
  allCurs,
  createOrUpdateCourseAdminReviewEntry,
  deleteUserFeedbackByIds,
  deleteUserFeedbackOlderThan,
  getUpdaterRuns,
  getUserFeedbackEntries,
  searchCoursesWithPagination,
  usersWithWhere,
} from '../util/dbActions.ts'
import { uniqueVals } from '../util/misc.ts'
import {
  getWhereClauseForManyWordSearch,
  getWhereClauseForOneWordSearch,
  getWhereClauseForTwoWordSearch,
} from '../util/usersSearchHelper.ts'
import filterConfigRouter from './filterConfigRouter.ts'
import statsRouter from './statsRouter.ts'

const UPDATER_RUN_URL = 'http://apparaatti-updater/api/updater/run'

const USER_FETCH_LIMIT = 100

const adminRouter = express.Router()

adminRouter.use(requireUser)
adminRouter.use(requireAdmin)

interface UserSearchQuery {
  search?: string
  onlyWithStudyRight?: boolean
  onlyEmployees?: boolean
}

adminRouter.get('/user-feedback', async (req, res) => {
  const userFeedbackQuerySchema = z.object({
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
  })

  const { start: queryStart, end: queryEnd } = userFeedbackQuerySchema.parse(req.query)
  const end = queryEnd ?? new Date()
  const start = queryStart ?? new Date(end)

  if (!queryStart) {
    start.setFullYear(start.getFullYear() - 1)
  }

  if (start > end) {
    res.status(400).send('Start date must be before end date')
    return
  }

  const feedback = await getUserFeedbackEntries(start, end)
  res.send(feedback)
})

adminRouter.delete('/user-feedback', async (req, res) => {
  const schema = z.object({ ids: z.array(z.number().int()).min(1) })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'ids must be a non-empty array of integers' })
    return
  }
  const deleted = await deleteUserFeedbackByIds(parsed.data.ids)
  res.json({ deleted })
})

adminRouter.delete('/user-feedback/older-than', async (req, res) => {
  const schema = z.object({ before: z.coerce.date() })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'before must be a valid date string' })
    return
  }
  const deleted = await deleteUserFeedbackOlderThan(parsed.data.before)
  res.json({ deleted })
})

adminRouter.get('/users', requireSuperuser, async (req, res) => {
  const { search } = req.query as UserSearchQuery
  if (!search) {
    res.status(400).send('Search string must be provided as a query parameter')
    return
  }
  if (search.trim().length < 5) {
    res.status(400).send('Search string must be at least 5 characters long')
    return
  }

  const trimmedSearch = search.trim()

  let whereClauses: Record<string, any> = {}

  const searchedWords = trimmedSearch.split(' ')

  if (searchedWords.length === 2) {
    whereClauses = {
      ...whereClauses,
      ...getWhereClauseForTwoWordSearch(trimmedSearch),
    }
  } else if (searchedWords.length > 2) {
    whereClauses = {
      ...whereClauses,
      ...getWhereClauseForManyWordSearch(trimmedSearch),
    }
  } else {
    // the search consists of only one word
    whereClauses = {
      ...whereClauses,
      ...getWhereClauseForOneWordSearch(trimmedSearch),
    }
  }

  const users = await usersWithWhere(whereClauses, USER_FETCH_LIMIT)
  res.send(users)
})

adminRouter.get('/courses', async (req, res) => {
  const { page = '1', limit = '50', name, urn, courseCode, excludeUrns, excludeCourseCodes, reviewStatus } = req.query

  const pageNum = parseInt(page as string, 10)
  const limitNum = parseInt(limit as string, 10)

  const result = await searchCoursesWithPagination(
    {
      nameSearch: name as string | undefined,
      urnSearch: urn as string | undefined,
      excludeUrns: excludeUrns as string | undefined,
      courseCodeSearch: courseCode as string | undefined,
      excludeCourseCodes: excludeCourseCodes as string | undefined,
      reviewStatus: reviewStatus as string | undefined,
    },
    pageNum,
    limitNum
  )

  res.send(result)
})

/**
 * returns all unique code urns and type urns
 */
adminRouter.get('/courses/urns', async (req, res) => {
  const realisations = await allCurs()

  const realisationCodeUrns = realisations
    .map(r => {
      return r.customCodeUrns ?? []
    })
    .flatMap(u => Object.values(u))
    .flat()
  const uniqueCodeUrns: string[] = uniqueVals(realisationCodeUrns)

  const realisationTypeUrns = realisations.map(r => r.courseUnitRealisationTypeUrn)
  const uniqueTypeUrns: string[] = uniqueVals(realisationTypeUrns)

  const result: UniqueUrnResponse = {
    codeUrns: uniqueCodeUrns,
    typeUrns: uniqueTypeUrns,
  }
  return res.json(result)
})

adminRouter.post('/course/review', async (req, res) => {
  const reviewSchema = z.object({
    curId: z.string().min(1),
    reviewed: z.string().min(1),
    comment: z.string().optional(),
  })

  const { curId, reviewed, comment } = reviewSchema.parse(req.body)
  const reviewState = await createOrUpdateCourseAdminReviewEntry(curId, reviewed, comment)

  res.json({ status: 'success', reviewState })
})

adminRouter.post('/updater/run', requireSuperuser, async (_req, res) => {
  try {
    const response = await axios.post(UPDATER_RUN_URL, undefined, { timeout: 10_000 })
    res.status(response.status).json(response.data)
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      res.status(e.response.status).json(e.response.data)
      return
    }
    res.status(502).json({ message: 'Failed to reach updater service' })
  }
})

adminRouter.get('/updater/runs', requireSuperuser, async (_req, res) => {
  const runs = await getUpdaterRuns()
  res.json(runs)
})

adminRouter.use('/stats', statsRouter)
adminRouter.use('/filter-config', filterConfigRouter)

export default adminRouter
