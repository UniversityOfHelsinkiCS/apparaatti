import express from 'express';
import { FORM } from '../data/form.ts';
import User from '../models/user.ts';
import Cur from '../models/cur.ts';
import Cu from '../models/cu.ts';
import Enrolment from '../models/enrolment.ts';

const router = express.Router();

router.use(express.json());

router.get('/form/1', (_req, res) => {
  res.json(FORM);
});

router.get('/users', async (_req, res) => {
  const users = await User.findAll()
  res.json(users);
})

router.get('/curs', async (_req, res) => {
  const curs = await Cur.findAll()
  res.json(curs);
})

router.get('/cus', async (_req, res) => {
  const cus = await Cu.findAll()
  res.json(cus);
})

router.get('/enrolments', async (_req, res) => {
  const enrolments = await Enrolment.findAll()
  res.json(enrolments);
})

export default router;