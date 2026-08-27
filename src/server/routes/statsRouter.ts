import express from 'express'
import { z } from 'zod'

import { getGroupLabel, getGroupLabels } from '../../common/datelabels.ts'
import type { LocalizedString } from '../../common/types.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import { getUserVisits } from '../util/dbActions.ts'
import { localLog } from '../util/dev.ts'

const statsRouter = express.Router()

statsRouter.use(requireAdmin)

type VisitorProfile = {
  organisationCode: string | null
  phase1Code: string | null
  phase2Code: string | null
}

type VisitorProfiles = Map<string, VisitorProfile>

const profileKey = (profile: VisitorProfile) =>
  `${profile.organisationCode ?? ''}|${profile.phase1Code ?? ''}|${profile.phase2Code ?? ''}`

const mergedProfile = (previous: VisitorProfile | undefined, visit: VisitorProfile): VisitorProfile => ({
  organisationCode: previous?.organisationCode ?? visit.organisationCode,
  phase1Code: previous?.phase1Code ?? visit.phase1Code,
  phase2Code: previous?.phase2Code ?? visit.phase2Code,
})

const visitorGroups = (profiles: VisitorProfiles) => {
  const groups = new Map<string, VisitorProfile & { count: number }>()

  for (const profile of profiles.values()) {
    const key = profileKey(profile)
    const previous = groups.get(key)
    groups.set(key, { ...profile, count: (previous?.count ?? 0) + 1 })
  }

  return Array.from(groups.values()).sort((a, b) => b.count - a.count)
}

//Returns unique users grouped by 'hour', 'day', 'month', 'year'
statsRouter.get('/', async (req, res) => {
  const statsQuerySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
    groupBy: z.enum(['hour', 'day', 'month', 'year']).default('day'),
  })

  const { start, end, groupBy } = statsQuerySchema.parse(req.query)
  const visits = await getUserVisits(new Date(start), new Date(end))
  localLog(visits, 'statsRouter')

  const profilesPerLabel = new Map<string, VisitorProfiles>()
  const profilesInRange: VisitorProfiles = new Map()
  const programmeNames: Record<string, LocalizedString> = {}

  for (const visit of visits) {
    const date = new Date(visit.date)
    if (Number.isNaN(date.getTime())) {
      continue
    }

    const visitProfile: VisitorProfile = {
      organisationCode: visit.organisationCode ?? null,
      phase1Code: visit.phase1ProgrammeCode ?? null,
      phase2Code: visit.phase2ProgrammeCode ?? null,
    }

    if (visit.phase1ProgrammeCode && visit.phase1ProgrammeName) {
      programmeNames[visit.phase1ProgrammeCode] = visit.phase1ProgrammeName
    }
    if (visit.phase2ProgrammeCode && visit.phase2ProgrammeName) {
      programmeNames[visit.phase2ProgrammeCode] = visit.phase2ProgrammeName
    }

    profilesInRange.set(visit.visitorHashHex, mergedProfile(profilesInRange.get(visit.visitorHashHex), visitProfile))

    const label = getGroupLabel(date, groupBy)
    const profiles = profilesPerLabel.get(label) ?? new Map<string, VisitorProfile>()
    profiles.set(visit.visitorHashHex, mergedProfile(profiles.get(visit.visitorHashHex), visitProfile))
    profilesPerLabel.set(label, profiles)
  }

  const groups = getGroupLabels(start, end, groupBy).map(label => ({
    label,
    visitors: visitorGroups(profilesPerLabel.get(label) ?? new Map<string, VisitorProfile>()),
  }))

  const total = { visitors: visitorGroups(profilesInRange) }

  const result = { groups, total, programmeNames }

  localLog(result, 'statsrouter')
  res.send(result)
})

export default statsRouter
