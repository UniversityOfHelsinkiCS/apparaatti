import express from 'express'
import { Op } from 'sequelize'

import requireAdmin from '../middleware/requireAdmin.ts'
import requireUser from '../middleware/requireUser.ts'
import {
  allCurCus,
  allCurCusRaw,
  allCurs,
  allCursRaw,
  cursWithWhereRaw,
  cusWithIds,
  cusWithWhere,
  organisationWithGroupIdOf,
  updateUserSettings,
} from '../util/dbActions.ts'
import { uniqueVals } from '../util/misc.ts'
import { urnInCustomCodeUrns } from '../util/organisationCourseRecommmendations.ts'

const debugRouter = express.Router({ mergeParams: true })

debugRouter.use(express.json())
debugRouter.use(requireUser)

//yes i know a get should not edit anything but this is convinient and only in local anyways
debugRouter.get('/reset/settings', requireAdmin, async (req: any, res: any) => {
  await updateUserSettings(req.user.id, { educationLanguage: '' })

  res.json({ message: 'User settings reset' })
})

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

debugRouter.get('/cur/debug', async (_req: any, res: any) => {
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

  const realisationCodeUrns = realisations
    .map((r: any) => r.customCodeUrns)
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
  const groupIds = courseUnits.map((cu: any) => cu.groupId).filter((gid: string | null) => gid !== null)
  const uniqueGroupIds = uniqueVals(groupIds)

  // Fetch organisation details for unique group IDs
  const uniqueOrganisations = await organisationWithGroupIdOf(uniqueGroupIds)

  res.json({ uniqueCodeUrns, uniqueTypeUrns, realisationsWithCodeUrn, uniqueOrganisations })
})

debugRouter.get('/cur', async (req: any, res: any) => {
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
  if (codeurn) {
    const urnFilteredCourses = curs.filter((cur: any) => {
      return urnInCustomCodeUrns(cur.customCodeUrns, codeurn as string)
    })
    return res.json(urnFilteredCourses)
  }

  res.json(curs)
})

debugRouter.get('/cu', async (req: any, res: any) => {
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

debugRouter.get('/strict', async (_req: any, res: any) => {
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

debugRouter.get('/curcu', async (_req: any, res: any) => {
  const curcur = await allCurCus()
  res.json(curcur)
})

export default debugRouter
