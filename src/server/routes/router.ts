import express from 'express';
import { FORM } from '../data/form.ts';

const router = express.Router();

router.use(express.json());

router.get('/form/1', (_req, res) => {
  res.json(FORM);
});

router.post('/form/1/answer', (req, res) => {
  const { answer } = req.body;
  console.log('Received answer:', answer);
  res.status(200).json({ message: 'Answer received successfully' });
})

export default router;