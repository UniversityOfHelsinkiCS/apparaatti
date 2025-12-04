
import { Op } from 'sequelize'
import express from 'express'
import type { User  as UserType } from '../../common/types.ts'
import {
  getWhereClauseForManyWordSearch,
  getWhereClauseForOneWordSearch,
  getWhereClauseForTwoWordSearch,
} from '../util/usersSearchHelper.ts'
import { enforceIsAdmin, enforceIsUser } from '../util/validations.ts'
import User from '../db/models/user.ts'

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

  console.log(req.body)
  const feedback: adminFeedback = req.body
  console.log(feedback)

  logger.info('ADMIN FEEDBACK', feedback)
  res.json({status: 'success'})
 
})

adminRouter.get('/users', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const { search, onlyEmployees, onlyWithStudyRight } = req.query as UserSearchQuery

  if (!search) {
    res.status(400).send('Search string must be provided as a query parameter')
  }
  if (search.trim().length < 5) {
    res.status(400).send('Search string must be at least 5 characters long')
  }

  const trimmedSearch = search.trim()

  let whereClauses: Record<string, any> = {}

  if (onlyWithStudyRight) {
    whereClauses = {
      ...whereClauses,
      hasStudyRight: {
        [Op.is]: true,
      },
    }
  }
  if (onlyEmployees) {
    whereClauses = {
      ...whereClauses,
      email: {
        [Op.not]: null,
      },
      employeeNumber: {
        [Op.not]: null,
      },
    }
  }

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

  const users: UserType[] = await User.findAll({
    where: whereClauses,
    limit: USER_FETCH_LIMIT,
    raw: true
  })
  res.send(users)
})

export default adminRouter
