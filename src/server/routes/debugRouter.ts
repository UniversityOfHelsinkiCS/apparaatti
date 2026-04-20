import express from 'express'
import { Op } from 'sequelize'

import { uniqueVals } from '../util/misc.ts'
import { urnInCustomCodeUrns } from '../util/organisationCourseRecommmendations.ts'
import { allCurs, allCursRaw, allCurCus, allCurCusRaw, cusWithIds, cusWithWhere, cursWithWhereRaw, organisationWithGroupIdOf } from '../util/dbActions.ts'

const debugRouter = express.Router({mergeParams: true})

debugRouter.use(express.json())

function getKktTags(customCodeUrns: Record<string, string[]> | null): string[] {
  if (!customCodeUrns) {
    return []
  }

  const kktTags: string[] = []
  for (const key of Object.keys(customCodeUrns)) {
    if (!key.includes('kk-apparaatti')) {
      continue
    }

    for (const value of customCodeUrns[key]) {
      if (value.includes('kkt-')) {
        kktTags.push(value)
      }
    }
  }

  return uniqueVals(kktTags)
}

debugRouter.get('/cur/debug', async (req: any, res: any) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const realisations = await allCurs()
  const realisationsWithCodeUrn = realisations.reduce((grouped: Record<string, any[]>, cur: any) => {
    const kktTags = getKktTags(cur.customCodeUrns)

    for (const tag of kktTags) {
      if (!grouped[tag]) {
        grouped[tag] = []
      }
      grouped[tag].push(cur)
    }

    return grouped
  }, {})
  const realisationCodeUrns = realisations.map((r: any) => r.customCodeUrns)
    .filter((u: any) => urnInCustomCodeUrns(u, 'kkt'))
    .flatMap((u: any) => Object.values(u))
    .flat()
  const uniqueCodeUrns = uniqueVals(realisationCodeUrns)

  const realisationTypeUrns = realisations.map((r: any) => r.courseUnitRealisationTypeUrn)
  const uniqueTypeUrns = uniqueVals(realisationTypeUrns)

  // Get all course unit realisations and their associated course units
  const allCurCus = await allCurCusRaw()
  const courseUnitIds = uniqueVals(allCurCus.map((cc: any) => cc.cuId))
  const courseUnits = await cusWithIds(courseUnitIds)

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

  const curs = await cursWithWhereRaw(nameQuery)
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
  const cus = await cusWithWhere(whereQuery)
  res.json(cus)
})

debugRouter.get('/strict', async (req: any, res: any) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const realisations = await allCursRaw()

  const grouped: Record<string, any[]> = {}

  for (const cur of realisations) {
    const customCodeUrns = (cur as any).customCodeUrns as Record<string, string[]> | null
    if (!customCodeUrns) continue

    const kktUrns: string[] = []
    for (const key of Object.keys(customCodeUrns)) {
      if (key.includes('kk-apparaatti')) {
        for (const val of customCodeUrns[key]) {
          if (val.includes('kkt-')) {
            kktUrns.push(val)
          }
        }
      }
    }

    for (const urn of kktUrns) {
      if (!grouped[urn]) grouped[urn] = []
      grouped[urn].push(cur)
    }
  }

  res.json(grouped)
})

debugRouter.get('/curcu', async (req: any, res: any) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const curcur = await allCurCus()
  res.json(curcur)
})

export default debugRouter
