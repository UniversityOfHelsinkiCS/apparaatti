export type VisitorProfile = {
  organisationCode: string | null
  phase1Code: string | null
  phase2Code: string | null
}

export type VisitorProfiles = Map<string, VisitorProfile>

export const profileKey = (profile: VisitorProfile) =>
  `${profile.organisationCode ?? ''}|${profile.phase1Code ?? ''}|${profile.phase2Code ?? ''}`

export const mergedProfile = (previous: VisitorProfile | undefined, visit: VisitorProfile): VisitorProfile => ({
  organisationCode: previous?.organisationCode ?? visit.organisationCode,
  phase1Code: previous?.phase1Code ?? visit.phase1Code,
  phase2Code: previous?.phase2Code ?? visit.phase2Code,
})

export const visitorGroups = (profiles: VisitorProfiles) => {
  const groups = new Map<string, VisitorProfile & { count: number }>()

  for (const profile of profiles.values()) {
    const key = profileKey(profile)
    const previous = groups.get(key)
    groups.set(key, { ...profile, count: (previous?.count ?? 0) + 1 })
  }

  return Array.from(groups.values()).sort((a, b) => b.count - a.count)
}
