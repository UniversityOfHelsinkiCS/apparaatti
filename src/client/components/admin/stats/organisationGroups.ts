import { organisationCodeToName } from '../../../../common/organisations.ts'

export type StatsOrganisation = {
  organisationCode: string | null
  count: number
  percentage: number
}

export type StatsRow = {
  label: string
  count: number
  organisations: StatsOrganisation[]
}

export type StatsResponse = {
  groups: StatsRow[]
  total: {
    count: number
    organisations: StatsOrganisation[]
  }
}

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
