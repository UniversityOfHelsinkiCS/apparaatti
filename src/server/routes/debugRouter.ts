import express from 'express'
import { Op } from 'sequelize'

import { uniqueVals } from '../util/misc.ts'
import Cur from '../db/models/cur.ts'
import Cu from '../db/models/cu.ts'
import CurCu from '../db/models/curCu.ts'
import { urnInCustomCodeUrns } from '../util/organisationCourseRecommmendations.ts'
import { organisationWithGroupIdOf } from '../util/dbActions.ts'

const debugRouter = express.Router({mergeParams: true})

debugRouter.use(express.json())

debugRouter.get('/cur/debug', async (req: any, res: any) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const realisations = await Cur.findAll({})
  const realisationsWithCodeUrn = realisations.filter(c => urnInCustomCodeUrns(c.customCodeUrns, 'far'))
  const realisationCodeUrns = realisations.map((r: any) => r.customCodeUrns)
    .filter((u: any) => urnInCustomCodeUrns(u, 'kkt'))
    .flatMap((u: any) => Object.values(u))
    .flat()
  const uniqueCodeUrns = uniqueVals(realisationCodeUrns)

  const realisationTypeUrns = realisations.map((r: any) => r.courseUnitRealisationTypeUrn)
  const uniqueTypeUrns = uniqueVals(realisationTypeUrns)

  // Get all course unit realisations and their associated course units
  const allCurCus = await CurCu.findAll({ raw: true })
  const courseUnitIds = uniqueVals(allCurCus.map((cc: any) => cc.cuId))
  const courseUnits = await Cu.findAll({ 
    where: { id: courseUnitIds },
    raw: true 
  })

  // Extract unique organisation group IDs
  const groupIds = courseUnits
    .map((cu: any) => cu.groupId)
    .filter((gid: string | null) => gid !== null)
  const uniqueGroupIds = uniqueVals(groupIds)

  // Fetch organisation details for unique group IDs
  const uniqueOrganisations = await organisationWithGroupIdOf(uniqueGroupIds)

  res.json({uniqueCodeUrns, uniqueTypeUrns, realisationsWithCodeUrn, uniqueOrganisations})
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
