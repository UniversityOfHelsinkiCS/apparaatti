import express from 'express'
import { AnswerSchema } from '../../common/validators.ts'
import passport from 'passport'
import recommendCourses, { getRealisationsWithCourseUnitCodes } from '../util/recommender.ts'
import { getStudyData } from '../util/studydata.ts'
import Organisation from '../db/models/organisation.ts'
import { Op } from 'sequelize'
import logger from '../util/logger.ts'
import debugRouter from './debugRouter.ts'
import { inDevelopment } from '../util/config.ts'
import { codesInOrganisations, courseHasCustomCodeUrn, getUserOrganisationRecommendations, readOrganisationRecommendationData } from '../util/organisationCourseRecommmendations.ts'
import type { adminFeedback, User } from '../../common/types.ts'
import { isAdmin } from '../util/validations.ts'
import loginAsMiddleware from '../middleware/loginAs.ts'
import adminRouter from './admin.ts'
import { organisationCodeToUrn } from '../util/constants.ts'

const router = express.Router({mergeParams: true})

router.use(express.json())
router.use(loginAsMiddleware)

if(inDevelopment){
  router.use('/debug', debugRouter)
}

router.use('/admin', adminRouter)
router.get('/organisations/supported', async(req, res) => {
  if(!req.user){
    res.status(404).json({ message: 'User not found' })
    return
  }
  const organisationCodes:string[]= Object.keys(organisationCodeToUrn)
  const organisations:Organisation[] = await Organisation.findAll({
    where: {
      code: {[Op.in]: organisationCodes}
    },
    raw: true
  })
  res.json(organisations)
  
})

router.get('/organisations/integrated', async(req, res) => {
  if(!req.user){
    res.status(404).json({ message: 'User not found' })
    return
  }

  const organisationsWithIntegratedStudies = []
  const organisationCodes = Object.keys(organisationCodeToUrn)
  for (const code of organisationCodes){
    const organisationRecommendations =  readOrganisationRecommendationData()
    const recommendations = getUserOrganisationRecommendations(code, organisationRecommendations)
    const organisationCourseCodes = codesInOrganisations(recommendations)
    const courseData = await getRealisationsWithCourseUnitCodes(organisationCourseCodes) 
    const integratedCourses = courseData.filter((c) => courseHasCustomCodeUrn(c, 'kks-int'))
    if(integratedCourses.length > 0){
      organisationsWithIntegratedStudies.push(code) 
    }
  }
  res.json(organisationsWithIntegratedStudies)
})

router.post('/form/answer', async (req, res) => {
  const answerData = AnswerSchema.parse(req.body)
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const submitInfo = {user: req.user, answerData}
  logger.info('User submitted a form', submitInfo)
  
  const recommendations = await recommendCourses(answerData)

  const resultData = {user: req.user, answerData, recommendations}
  logger.info('User got answer from a form', resultData)

  res.json({...recommendations, answerData})
})

router.get('/login', passport.authenticate('oidc'))

router.get(
  '/login/callback',
  passport.authenticate('oidc', { failureRedirect: '/' }),
  async (req, res) => {
    res.redirect('/')
  }
)

router.get('/user', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const adminStatus = isAdmin(req.user)
  const returnData: User = {
    ...req.user,
    isAdmin: adminStatus
  }

  res.json(returnData)
})

router.get('/user/studydata', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const studydata = await getStudyData(req.user)

  res.json(studydata)
})


router.get('/organisations', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const organisations = await Organisation.findAll({})
  res.json(organisations)
    

})

router.get('/fail', async (_req, res) => {
  res.json({
    message: 'Login failed',
  })
})

router.get('/logout', async (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/')
  })

  res.redirect('/')
})

export default router
