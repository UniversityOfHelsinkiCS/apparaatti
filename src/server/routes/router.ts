import express from 'express';
import { FORM } from '../data/form.ts';
import { AnswerSchema } from '../../common/validators.ts';
import Answer from '../models/answer.ts';
import User from '../models/user.ts';
import passport from 'passport';


const router = express.Router();

router.use(express.json());

router.get('/form/1', (_req, res) => {
  res.json(FORM);
});

router.post('/form/1/answer', async (req, res) => {
  const answerData = AnswerSchema.parse(req.body);

  console.log('Answer received:', answerData);

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

  res.json(answer);
})

router.get('/login', passport.authenticate('oidc'))

router.get('/login/callback', passport.authenticate('oidc', { failureRedirect: '/' }), (_, res) => {
  res.redirect('/api/ping')
})


export default router;