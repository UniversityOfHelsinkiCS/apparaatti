
import express from 'express'
import type { User  as UserType, adminFeedback } from '../../common/types.ts'
import {
  getWhereClauseForManyWordSearch,
  getWhereClauseForOneWordSearch,
  getWhereClauseForTwoWordSearch,
} from '../util/usersSearchHelper.ts'
import { enforceIsAdmin, enforceIsSuperuser, enforceIsUser } from '../util/validations.ts'
import { usersWithWhere } from '../util/dbActions.ts'
import logger from '../util/logger.ts'
import filterConfigRouter from './filterConfigRouter.ts'

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

adminRouter.use('/filter-config', filterConfigRouter)

export default adminRouter
