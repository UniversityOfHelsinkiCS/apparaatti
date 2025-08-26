import express from 'express'
import { AnswerSchema } from '../../common/validators.ts'

import passport from 'passport'
import Form from '../db/models/form.ts'
import recommendCourses, { organisationCodeToUrn } from '../util/recommender.ts'
import { getStudyData } from '../util/studydata.ts'
import Organisation from '../db/models/organisation.ts'
import { Op } from 'sequelize'
import logger from '../util/logger.ts'
import debugRouter from './debugRouter.ts'
import { inDevelopment } from '../util/config.ts'

const router = express.Router({mergeParams: true})

router.use(express.json())

if(inDevelopment){
  router.use('/debug', debugRouter)
}

router.get('/form/1', async (_req, res) => {
  const form = await Form.findByPk(1)

  res.json(form)
})

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

router.post('/form/1/answer', async (req, res) => {
  const answerData = AnswerSchema.parse(req.body)
  console.log(answerData)
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const submitInfo = {user: req.user, answerData}
  logger.info('User submitted a form', submitInfo)
  //  await saveAnswer(answerData, user)
  
  const recommendations = await recommendCourses(answerData)
  const resultData = {user: req.user, answerData, recommendations}
  logger.info('User got answer from a form', resultData)
  res.json(recommendations)
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
  res.json(req.user)
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
