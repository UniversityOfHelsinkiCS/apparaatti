import express from 'express'
import { z } from 'zod'
import {
  getWhereClauseForManyWordSearch,
  getWhereClauseForOneWordSearch,
  getWhereClauseForTwoWordSearch,
} from '../util/usersSearchHelper.ts'
import {
  createOrUpdateCourseAdminReviewEntry,
  getUserFeedbackEntries,
  getUpdaterRuns,
  usersWithWhere,
} from '../util/dbActions.ts'
import filterConfigRouter from './filterConfigRouter.ts'
import { searchCoursesWithPagination } from '../util/dbActions.ts'
import statsRouter from './statsRouter.ts'
import requireUser from '../middleware/requireUser.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import requireSuperuser from '../middleware/requireSuperuser.ts'
import { triggerUpdaterRun } from '../updater/manualRun.ts'

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

adminRouter.post('/updater/run', requireSuperuser, async (req, res) => {
  const user = req.user
  const triggeredBy = user?.username ?? user?.id ?? 'manual run'
  const runRow = await triggerUpdaterRun(triggeredBy)
  if (!runRow) {
    res.status(409).json({ message: 'A run is already in progress' })
    return
  }
  res.status(202).json(runRow)
})

adminRouter.get('/updater/runs', requireSuperuser, async (_req, res) => {
  const runs = await getUpdaterRuns()
  res.json(runs)
})

adminRouter.use('/stats', statsRouter)
adminRouter.use('/filter-config', filterConfigRouter)

export default adminRouter
