import express from 'express';
import { FORM } from '../data/form.ts';
import { AnswerSchema } from '../../common/validators.ts';
import Answer from '../db/models/answer.ts';
import User from '../db/models/user.ts';
import passport from 'passport';
import type { CourseRecommendation } from '../../common/types.ts';
import Form from '../db/models/form.ts';


const router = express.Router();

router.use(express.json());

router.get('/form/1', async (_req, res) => {
  const form = await Form.findByPk(1);

  res.json(form);
});

router.post('/form/1/answer', async (req, res) => {
  const answerData = AnswerSchema.parse(req.body);


  const user = await User.findByPk("1");

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return
  }

  const answer = await Answer.create({
    answer: answerData,
    userId: user.id,
    formId: 1,
  });

  // do the recommendation calculation
  const recommendations: CourseRecommendation[] = [
    {
      id: '1',
      name: 'Course 1',
      description: 'Description 1',
      courseCode: 'CS101',
      credits: 5,
      url: 'https://example.com/course1',
    },
    {
      id: '2',
      name: 'Course 2',
      description: 'Description 2',
      courseCode: 'CS102',
      credits: 5,
      url: 'https://example.com/course2',
    },
    {
      id: '3',
      name: 'Course 3',
      description: 'Description 3',
      courseCode: 'CS103',
      credits: 5,
      url: 'https://example.com/course3',
    }
  ]

  res.json(recommendations);
})

router.get('/login', passport.authenticate('oidc'))

router.get('/login/callback', passport.authenticate('oidc', { failureRedirect: '/' }), async (req, res) => {
  res.redirect('/');
})


router.get('/user', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }
  res.json(req.user);
})

router.get('/fail', async (_req, res) => {
  res.json({
    message: 'Login failed',
  });
})


router.get('/logout', async (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }

  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/')  
  })

  res.redirect('/');

  
})



export default router;