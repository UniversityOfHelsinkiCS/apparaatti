import express from 'express'
import { AnswerSchema } from '../../common/validators.ts'
import Answer from '../db/models/answer.ts'
import User from '../db/models/user.ts'
import passport from 'passport'
import Form from '../db/models/form.ts'
import recommendCourses from '../util/recommender.ts'
import Cur from '../db/models/cur.ts'
import { json, Op } from 'sequelize'
import Cu from '../db/models/cu.ts'
import CurCu from '../db/models/curCu.ts'
import StudyRight from '../db/models/studyRight.ts'
import { getStudyData } from '../util/studydata.ts'

const router = express.Router()

router.use(express.json())

router.get('/form/1', async (_req, res) => {
  const form = await Form.findByPk(1)

  res.json(form)
})

async function saveAnswer(answerData: any, user: User) {
  const answer = await Answer.create({
    answer: answerData,
    userId: user.id,
    formId: 1,
  })
  return answer
}

router.post('/form/1/answer', async (req, res) => {
  const answerData = AnswerSchema.parse(req.body)
  console.log(answerData)

  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  console.log('after user')
  //  await saveAnswer(answerData, user)
  console.log('after answer')
  const recommendations = await recommendCourses(answerData, req.user)
  res.json(recommendations)
})

router.get('/login', passport.authenticate('oidc'))

router.get('/login/callback', passport.authenticate('oidc', { failureRedirect: '/' }), async (req, res) => {
  res.redirect('/')
})


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

  const mockStudyData = {
    phase1Data: [{id: 'id123', code: 'code123', name: {fi: 'Matemaattis luonnontieteellinen'}}],
    phase2Data:  []
    //phase2Data: [{id: 'id321', code: 'code321', name: {fi: "Biologian maisteri"}}]
  }
  res.json(studydata)
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

  const realisations = await Cur.findAll({
    include: {
      model: Cu,
      required: true
    }
  })

  res.json(realisations)
})


router.get('/cur', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const { name } = req.query 

  const nameQuery = name
    ? { 
      [Op.or]: [
        { 'name.fi': { [Op.like]: `%${name}%` } },
        { 'name.en': { [Op.like]: `%${name}%` } },
        { 'name.sv': { [Op.like]: `%${name}%` } },
      ],
    }
    : {}

  const curs = await Cur.findAll({where: nameQuery})
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
