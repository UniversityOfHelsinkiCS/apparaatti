import express from 'express'
import { Op } from 'sequelize'

import { uniqueVals } from '../util/misc.ts'
import Cur from '../db/models/cur.ts'
import Cu from '../db/models/cu.ts'
import CurCu from '../db/models/curCu.ts'
import { urnInCustomCodeUrns } from '../util/organisationCourseRecommmendations.ts'

const debugRouter = express.Router({mergeParams: true})

debugRouter.use(express.json())

debugRouter.get('/cur/debug', async (req: any, res: any) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const realisations = await Cur.findAll({})
  const realisationCodeUrns = realisations.map((r: any) => r.customCodeUrns)
    .filter((u: any) => urnInCustomCodeUrns(u, 'kkt'))
    .flatMap((u: any) => Object.values(u))
    .flat()
  const uniqueCodeUrns = uniqueVals(realisationCodeUrns)

  const realisationTypeUrns = realisations.map((r: any) => r.courseUnitRealisationTypeUrn)
  const uniqueTypeUrns = uniqueVals(realisationTypeUrns)

  res.json({uniqueCodeUrns, uniqueTypeUrns})
})

debugRouter.get('/cur', async (req: any, res: any) => {
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
  if(codeurn){
    const urnFilteredCourses = curs.filter((cur: any) => {
      return urnInCustomCodeUrns(cur.customCodeUrns, codeurn as string)
    })
    return res.json(urnFilteredCourses)
  }
  
  res.json(curs)
})

debugRouter.get('/cu', async (req: any, res: any) => {
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

debugRouter.get('/curcu', async (req: any, res: any) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const curcur = await CurCu.findAll()
  res.json(curcur)
})

export default debugRouter
