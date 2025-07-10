import express from 'express'
import { AnswerSchema } from '../../common/validators.ts'

import passport from 'passport'
import Form from '../db/models/form.ts'
import recommendCourses from '../util/recommender.ts'
import Cur from '../db/models/cur.ts'
import { Op } from 'sequelize'
import Cu from '../db/models/cu.ts'
import CurCu from '../db/models/curCu.ts'
import { getStudyData } from '../util/studydata.ts'
import Organisation from '../db/models/organisation.ts'
import {urnInCustomCodeUrns } from '../util/organisationCourseRecommmendations.ts'

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
  
  const recommendations = await recommendCourses(answerData, req.user)
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
router.get('/cur/debug', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const realisations = await Cur.findAll({})
  const realisationCodeUrns = realisations.map((r) => r.customCodeUrns).filter((u) => urnInCustomCodeUrns(r, 'kkt'))
  

  res.json(realisationCodeUrns)
})

router.get('/cur', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const { name, codeurn } = req.query

  const nameQuery = name
    ? {
      [Op.or]: [
        { 'name.fi': { [Op.like]: `%${name}%` } },
        { 'name.en': { [Op.like]: `%${name}%` } },
        { 'name.sv': { [Op.like]: `%${name}%` } },
      ],
    }
    : {}

  const curs = await Cur.findAll({ where: nameQuery, raw: true })
  console.log('code urn is: ', codeurn)
  if(codeurn){
    const urnFilteredCourses = curs.filter((cur) => {
      return urnInCustomCodeUrns(cur.customCodeUrns, codeurn)
    })
    return res.json(urnFilteredCourses)
  }
  
  res.json(curs)
})

router.get('/cu', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const { name, code } = req.query

  const nameQuery = name
    ? {
      [Op.or]: [
        { 'name.fi': { [Op.like]: `%${name}%` } },
        { 'name.en': { [Op.like]: `%${name}%` } },
        { 'name.sv': { [Op.like]: `%${name}%` } },
      ],
    }
    : {}

  const codeQuery = code
    ? {
      courseCode: { [Op.like]: `%${code}%` },
    }
    : {}

  const whereQuery = {
    ...nameQuery,
    ...codeQuery,
  }
  const cus = await Cu.findAll({ where: whereQuery })
  res.json(cus)
})

router.get('/curcu', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const curcus = await CurCu.findAll()
  res.json(curcus)
})

export default router
