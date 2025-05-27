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


  const user = await User.findByPk('1')

  if (!user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  await saveAnswer(answerData, user)
  const recommendations = await recommendCourses(answerData)
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


router.get('/cur', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
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






router.get('/cur/analyze', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
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
  const wordCounts: Record<string, string[]> = {};
  curs.forEach((cur) => {
    const names = [cur.name?.fi, cur.name?.en, cur.name?.sv].filter(Boolean);
    names.forEach((name) => {
      const words = name.split(/\s+/); 
      words.forEach((word) => {
        const normalizedWord = word.toLowerCase();
        if (normalizedWord in wordCounts){
          wordCounts[normalizedWord].push(cur.name.fi as string);
        }
        else{
          wordCounts[normalizedWord] = [cur.name.fi as string];
        }
       
      });
    });
  });
 
  
  res.json(wordCounts)
})

router.get('/cu', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
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
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const curcus = await CurCu.findAll()
  res.json(curcus)
})


export default router
