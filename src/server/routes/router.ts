import type { Response } from 'express'
import express from 'express'
import passport from 'passport'

import type {
  AnswerData,
  CourseData,
  RecommendationMetadata,
  UpdaterRunKind,
  UserSettings as UserSettingsType,
} from '../../common/types.ts'
import type { FormSubmission, User } from '../../common/types.ts'
import {
  AnswerSchema,
  BackendLocaleQuerySchema,
  UserFeedbackSchema,
  UserSettingsSchema,
} from '../../common/validators.ts'
import loginAsMiddleware from '../middleware/loginAs.ts'
import requireUser from '../middleware/requireUser.ts'
import { triggerUpdaterRun } from '../updater/manualRun.ts'
import { resolveBackendLocales } from '../util/backendLocales.ts'
import {
  GIT_SHA,
  IMAGE_SHA,
  IN_E2E,
  inDevelopment,
  PACKAGE_VERSION,
  RELEASE_VERSION,
  UPDATER_CRON_ENABLED,
} from '../util/config.ts'
import { organisationCodeToUrn } from '../util/constants.ts'
import {
  allBackendLocaleKeys,
  allOrganisations,
  createUserFeedbackEntry,
  enabledOrderedFilterConfigs,
  getUserSettings,
  organisationsWithSupportedCodes,
  updateUserSettings,
} from '../util/dbActions.ts'
import {
  codesInOrganisations,
  courseHasCustomCodeUrn,
  getUserOrganisationRecommendations,
  readOrganisationRecommendationData,
} from '../util/organisationCourseRecommmendations.ts'
import { getCourseData, getRealisationsWithCourseUnitCodes } from '../util/recommender.ts'
import { getStudyData } from '../util/studydata.ts'
import { saveUserVisitIfUnique } from '../util/userVisitHelpers.ts'
import { isAdmin, isSuperuser } from '../util/validations.ts'
import adminRouter from './admin.ts'
import debugRouter from './debugRouter.ts'

const router = express.Router({ mergeParams: true })

router.use(express.json())
router.use(loginAsMiddleware)

if (inDevelopment || IN_E2E) {
  router.use('/debug', requireUser, debugRouter)
}

router.use('/admin', requireUser, adminRouter)

if (UPDATER_CRON_ENABLED) {
  router.post('/updater/run', async (req, res) => {
    const runtype = (req.body?.runtype ?? 'full') as UpdaterRunKind
    if (runtype !== 'full' && runtype !== 'courses') {
      res.status(400).json({ message: 'Invalid runtype' })
      return
    }
    console.log(`updater started running (${runtype})`)
    const runRow = await triggerUpdaterRun('manual run', runtype)
    if (!runRow) {
      res.status(409).json({ message: 'A run is already in progress' })
      return
    }
    res.status(202).json(runRow)
  })
}

router.get('/version', requireUser, (req, res) => {
  res.json({
    gitSha: GIT_SHA,
    packageVersion: PACKAGE_VERSION,
    imageSha: IMAGE_SHA,
    releaseVersion: RELEASE_VERSION,
  })
})

router.get('/filter-config', requireUser, async (req, res) => {
  const filters = await enabledOrderedFilterConfigs()
  res.json(filters)
})

router.get('/backend-locales', requireUser, async (req, res) => {
  const parsed = BackendLocaleQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid query', errors: parsed.error.flatten() })
    return
  }

  const keys = await allBackendLocaleKeys()
  const locales = resolveBackendLocales(keys, {
    organisationCode: parsed.data.organisation ?? '',
    lang: parsed.data.lang ?? '',
    primaryLanguage: parsed.data.primaryLanguage ?? '',
    primaryLanguageSpecification: parsed.data.primaryLanguageSpecification ?? '',
  })

  res.json({ locales })
})

router.get('/organisations/supported', requireUser, async (req, res) => {
  const organisationCodes: string[] = Object.keys(organisationCodeToUrn)
  const organisations = await organisationsWithSupportedCodes(organisationCodes)
  res.json(organisations)
})

router.get('/organisations/integrated', requireUser, async (req, res) => {
  const organisationsWithIntegratedStudies = []
  const organisationCodes = Object.keys(organisationCodeToUrn)
  for (const code of organisationCodes) {
    const organisationRecommendations = readOrganisationRecommendationData()
    const recommendations = getUserOrganisationRecommendations(code, organisationRecommendations)
    const organisationCourseCodes = codesInOrganisations(recommendations)
    const courseData = await getRealisationsWithCourseUnitCodes(organisationCourseCodes)
    const integratedCourses = courseData.filter(c => courseHasCustomCodeUrn(c, 'kks-int'))
    if (integratedCourses.length > 0) {
      organisationsWithIntegratedStudies.push(code)
    }
  }
  res.json(organisationsWithIntegratedStudies)
})

router.post('/form/coursedata', requireUser, async (req, res: Response<CourseData[]>) => {
  const submission: FormSubmission = req.body
  const answerData = AnswerSchema.parse(submission.answerData) as AnswerData

  const result = await getCourseData(answerData)
  return res.json(result)
})

router.post('/feedback', requireUser, async (req, res) => {
  const feedback = UserFeedbackSchema.parse(req.body)
  const user = req.user as User
  const email = feedback.sendContactEmail ? (user.email ?? undefined) : undefined
  await createUserFeedbackEntry(
    feedback.textFeedback,
    feedback.stars,
    new Date(),
    feedback.recommendationMetadata as RecommendationMetadata,
    feedback.appVersion,
    email
  )

  res.json({ status: 'success' })
})

router.get('/login', passport.authenticate('oidc'))

router.get('/login/callback', passport.authenticate('oidc', { failureRedirect: '/' }), async (_req, res) => {
  res.redirect('/')
})

router.get('/user', requireUser, async (req, res) => {
  const user = req.user as User
  await saveUserVisitIfUnique(user)

  const adminStatus = isAdmin(user)
  const superuserStatus = isSuperuser(user)
  const returnData: User = {
    ...user,
    isAdmin: adminStatus,
    isSuperuser: superuserStatus,
  }

  res.json(returnData)
})

router.get('/user/settings', requireUser, async (req, res) => {
  const user = req.user as User
  const settings = await getUserSettings(user.id)
  if (settings) {
    res.json(settings)
  } else {
    const newSettings = await updateUserSettings(user.id, { educationLanguage: '' })
    res.json(newSettings)
  }
})

router.post('/user/settings', requireUser, async (req, res) => {
  const user = req.user as User
  const settings = UserSettingsSchema.parse(req.body) as UserSettingsType
  const updated = await updateUserSettings(user.id, settings)
  res.json(updated)
})

router.get('/user/studydata', requireUser, async (req, res) => {
  const studydata = await getStudyData(req.user as User)

  res.json(studydata)
})

router.get('/organisations', requireUser, async (req, res) => {
  const organisations = await allOrganisations()
  res.json(organisations)
})

router.get('/fail', async (_req, res) => {
  res.json({
    message: 'Login failed',
  })
})

router.get('/logout', requireUser, async (req, res, next) => {
  req.logout(err => {
    if (err) return next(err)
    res.redirect('/')
  })

  res.redirect('/')
})

export default router
