import express from 'express';
import { FORM } from '../data/form.ts';

const router = express.Router();

router.use(express.json());

router.get('/form/1', (_req, res) => {
  res.send(FORM);
});

export default router;