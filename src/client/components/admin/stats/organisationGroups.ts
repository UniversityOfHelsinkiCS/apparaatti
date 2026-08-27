import { organisationCodeToName } from '../../../../common/organisations.ts'
import type { LocalizedString } from '../../../../common/types.ts'

export type StatsVisitorGroup = {
  organisationCode: string | null
  phase1Code: string | null
  phase2Code: string | null
  count: number
}

export type StatsRow = {
  label: string
  visitors: StatsVisitorGroup[]
}

export type StatsResponse = {
  groups: StatsRow[]
  total: { visitors: StatsVisitorGroup[] }
  programmeNames: Record<string, LocalizedString>
}

export type StatsPhase = 'phase1' | 'phase2'

export type StatsFilters = {
  organisations: string[]
  phase1: string[]
  phase2: string[]
}

export const emptyStatsFilters: StatsFilters = { organisations: [], phase1: [], phase2: [] }

export const UNKNOWN_PROGRAMME = 'unknown'

export const programmeKeyOf = (code: string | null) => code ?? UNKNOWN_PROGRAMME

export const isVisitorVisible = (visitor: StatsVisitorGroup, filters: StatsFilters) =>
  !filters.organisations.includes(groupKeyOf(visitor.organisationCode)) &&
  !filters.phase1.includes(programmeKeyOf(visitor.phase1Code)) &&
  !filters.phase2.includes(programmeKeyOf(visitor.phase2Code))

export const programmeCodeOf = (visitor: StatsVisitorGroup, phase: StatsPhase) =>
  phase === 'phase1' ? visitor.phase1Code : visitor.phase2Code

//study programme codes are open ended so the palette is cycled by slice order instead of mapped by code
export const programmePalette = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
  '#008300',
  '#4a3aa7',
  '#e34948',
  '#184f95',
  '#a63f18',
  '#0e6b4a',
  '#8a5e00',
  '#a1436a',
  '#004d00',
  '#2c2266',
  '#8f2b2a',
]

export const UNKNOWN_PROGRAMME_COLOR = '#898781'

const NO_ORGANISATION = 'none'
const OTHER_ORGANISATIONS = 'other'

export const organisationColors: Record<string, string> = {
  [NO_ORGANISATION]: '#898781',
  H40: '#2a78d6',
  H50: '#eb6834',
  H20: '#1baf7a',
  H10: '#eda100',
  H74: '#e87ba4',
  H70: '#008300',
  H90: '#4a3aa7',
  H60: '#e34948',
  H57: '#184f95',
  H80: '#a63f18',
  '4141': '#0e6b4a',
  H305: '#8a5e00',
  H30: '#a1436a',
  H3456: '#004d00',
  '414': '#2c2266',
  H55: '#8f2b2a',
  [OTHER_ORGANISATIONS]: '#52514e',
}

//the order organisations are stacked in and listed in the legend
export const stackOrder = Object.keys(organisationColors)

export const groupKeyOf = (organisationCode: string | null) => {
  if (organisationCode === null) {
    return NO_ORGANISATION
  }

  return organisationCode in organisationColors ? organisationCode : OTHER_ORGANISATIONS
}

export const groupLabelOf = (groupKey: string) => {
  if (groupKey === NO_ORGANISATION) {
    return 'No organisation'
  }

  if (groupKey === OTHER_ORGANISATIONS) {
    return 'Other organisations'
  }

  return organisationCodeToName[groupKey] ?? groupKey
}
