import express from 'express'
import { AnswerSchema } from '../../common/validators.ts'

import passport from 'passport'
import Form from '../db/models/form.ts'
import recommendCourses from '../util/recommender.ts'
import { getStudyData } from '../util/studydata.ts'
import Organisation from '../db/models/organisation.ts'

const router = express.Router()

router.use(express.json())

router.get('/form/1', async (_req, res) => {
  const form = await Form.findByPk(1)

  res.json(form)
})

router.post('/form/1/answer', async (req, res) => {
  const answerData = AnswerSchema.parse(req.body)
  console.log(answerData)
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  
  //  await saveAnswer(answerData, user)
  
  const recommendations = await recommendCourses(answerData)
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
