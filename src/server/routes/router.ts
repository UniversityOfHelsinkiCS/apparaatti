import type { Response } from 'express'
import express from 'express'
import { AnswerSchema, StringArraySchema, UserFeedbackSchema } from '../../common/validators.ts'
import type { AnswerData, CourseData } from '../../common/types.ts'
import passport from 'passport'
import recommendCourses, { getCourseData, getRealisationsWithCourseUnitCodes } from '../util/recommender.ts'
import { getStudyData } from '../util/studydata.ts'
import debugRouter from './debugRouter.ts'
import { inDevelopment, UPDATER_CRON_ENABLED, GIT_SHA, PACKAGE_VERSION, IMAGE_SHA, RELEASE_VERSION } from '../util/config.ts'
import { codesInOrganisations, courseHasCustomCodeUrn, getUserOrganisationRecommendations, readOrganisationRecommendationData } from '../util/organisationCourseRecommmendations.ts'
import type { FormSubmission, User } from '../../common/types.ts'
import { isAdmin, isSuperuser } from '../util/validations.ts'
import loginAsMiddleware from '../middleware/loginAs.ts'
import adminRouter from './admin.ts'
import { organisationCodeToUrn } from '../util/constants.ts'
import { run as runUpdater } from '../updater/index.ts'
import { allOrganisations, createUserFeedbackEntry, enabledOrderedFilterConfigs, organisationsWithSupportedCodes } from '../util/dbActions.ts'
import { saveUserVisitIfUnique } from '../util/userVisitHelpers.ts'
import { enforceIsUser } from '../util/validations.ts'

const router = express.Router({mergeParams: true})

router.use(express.json())
router.use(loginAsMiddleware)

if(inDevelopment){
  router.use('/debug', debugRouter)
}

router.use('/admin', adminRouter)

if (UPDATER_CRON_ENABLED) {
  router.post('/updater/run', async (_req, res) => {
    try {
      await runUpdater(true)
      res.json({ message: 'Updater run completed successfully' })
    } catch (error) {
      res.status(500).json({ message: 'Updater run failed'})
    }
  })
}

router.get('/version', (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  res.json({
    gitSha: GIT_SHA,
    packageVersion: PACKAGE_VERSION,
    imageSha: IMAGE_SHA,
    releaseVersion: RELEASE_VERSION,
  })
})

router.get('/filter-config', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  const filters = await enabledOrderedFilterConfigs()
  res.json(filters)
})

router.get('/organisations/supported', async(req, res) => {
  if(!req.user){
    res.status(404).json({ message: 'User not found' })
    return
  }
  const organisationCodes:string[]= Object.keys(organisationCodeToUrn)
  const organisations = await organisationsWithSupportedCodes(organisationCodes)
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

  const submission:FormSubmission = req.body
  const answerData = AnswerSchema.parse(submission.answerData) as AnswerData
  const strictFields: string[] = StringArraySchema.parse(submission.strictFields)

  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const recommendations = await recommendCourses(answerData as AnswerData, strictFields)

  res.json({...recommendations, answerData})
})


router.post('/form/coursedata', async (req, res: Response<CourseData[]>) => {
  enforceIsUser(req)

  const submission:FormSubmission = req.body
  const answerData = AnswerSchema.parse(submission.answerData) as AnswerData

  const result = await getCourseData(answerData)
  return res.json(result)

})


router.post('/feedback', async (req, res) => {
  enforceIsUser(req)

  const feedback = UserFeedbackSchema.parse(req.body)
  await createUserFeedbackEntry(
    feedback.textFeedback,
    feedback.stars,
    new Date(),
    feedback.recommendationMetadata,
    feedback.appVersion
  )

  res.json({ status: 'success' })
})

router.get('/login', passport.authenticate('oidc'))

router.get(
  '/login/callback',
  passport.authenticate('oidc', { failureRedirect: '/' }),
  async (_req, res) => {
    res.redirect('/')
  }
)

router.get('/user', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const user = req.user as User
  await saveUserVisitIfUnique(user)

  const adminStatus = isAdmin(user)
  const superuserStatus = isSuperuser(user)
  const returnData: User = {
    ...user,
    isAdmin: adminStatus,
    isSuperuser: superuserStatus
  }

  res.json(returnData)
})

router.get('/user/studydata', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const studydata = await getStudyData(req.user as User)

  res.json(studydata)
})


router.get('/organisations', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const organisations = await allOrganisations()
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
