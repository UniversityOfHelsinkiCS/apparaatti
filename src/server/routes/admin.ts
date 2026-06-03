
import express from 'express'
import type { User  as UserType, adminFeedback } from '../../common/types.ts'
import { z } from 'zod'
import {
  getWhereClauseForManyWordSearch,
  getWhereClauseForOneWordSearch,
  getWhereClauseForTwoWordSearch,
} from '../util/usersSearchHelper.ts'
import { enforceIsAdmin, enforceIsSuperuser, enforceIsUser } from '../util/validations.ts'
import { createOrUpdateCourseAdminReviewEntry, getUserFeedbackEntries, usersWithWhere } from '../util/dbActions.ts'
import logger from '../util/logger.ts'
import filterConfigRouter from './filterConfigRouter.ts'
import { searchCoursesWithPagination } from '../util/dbActions.ts'
import statsRouter from './statsRouter.ts'
  

const USER_FETCH_LIMIT = 100

const adminRouter = express.Router()

interface UserSearchQuery {
  search?: string
  onlyWithStudyRight?: boolean
  onlyEmployees?: boolean
}

adminRouter.post('/feedback', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const feedback: adminFeedback = req.body

  logger.info('ADMIN FEEDBACK', feedback)
  res.json({status: 'success'})
 
})

adminRouter.get('/user-feedback', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

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

adminRouter.get('/users', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsSuperuser(user)

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
  res.send(users as UserType[])
})

adminRouter.get('/courses', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

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
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const reviewSchema = z.object({
    curId: z.string().min(1),
    reviewed: z.string().min(1),
    comment: z.string().optional(),
  })

  const { curId, reviewed, comment } = reviewSchema.parse(req.body)
  const reviewState = await createOrUpdateCourseAdminReviewEntry(curId, reviewed, comment)

  res.json({ status: 'success', reviewState })
})

adminRouter.use('/stats', statsRouter)
adminRouter.use('/filter-config', filterConfigRouter)

export default adminRouter
