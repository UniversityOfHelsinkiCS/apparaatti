

export const organisationCodeToUrn: Record<string, string> = {
  'H40' : 'kkt-hum',
  'H50': 'kkt-mat',
  'H20': 'kkt-oik',
  'H10': 'kkt-teo',
  'H74': 'kkt-ssk',
  'H70': 'kkt-val', //kkt-val -> valtiotieteel. might be confused with kks-val -> valmistuville, graduation,
  'H90': 'kkt-ela',
  'H60': 'kkt-kas', //kasvatustieteel.
  'H57': 'kkt-bio',
  'H80': 'kkt-mm', //maa metsa
  '4141': 'kkt-sps', //soveltava spykologia
  'H305': 'kkt-ham',
  'H30': 'kkt-laa',
  'H3456': 'kkt-log', //logopedia seems to have multiple entries in organisations with the same name
  '414': 'kkt-psy',
  'H55': 'kkt-far'
 
}

//these are values that are stored with courses in sisu
export const allowedStudyPlaces: string[] = [
  'teaching-participation-remote',
  'teaching-participation-online',
  'teaching-participation-blended',
  'teaching-participation-contact',
]

// Frontend option aliases that map to canonical Sisu study-place IDs.
export const studyPlaceAliasToCanonicalIds: Record<string, string[]> = {
  online: ['teaching-participation-remote', 'teaching-participation-online'],
  remote: ['teaching-participation-remote'],
  contact: ['teaching-participation-contact'],
  blended: ['teaching-participation-blended'],
}

export function resolveStudyPlaceLookups(studyPlaceSelections: string[]): string[] {
  const lookups = studyPlaceSelections.flatMap((selection) => {
    if (allowedStudyPlaces.includes(selection)) {
      return [selection]
    }

    return studyPlaceAliasToCanonicalIds[selection] ?? []
  })

  return [...new Set(lookups)]
}

// Organisation names that indicate collaboration courses
export const collaborationOrganisationNames: string[] = [
  'Vaasa'
]


export const collaborationOrganisationCourseNameIncludes: string[] = [
  'työväen akatemia',
  'laajasalon opisto'
]

//constants used in the recommender
export const correctValue = 1
export const incorrectValue = 0
export const notAnsweredValue = null

//these are used in point based recommending make sure that pointsForCorrectFilter is > bonuspoint in order for the user filters to work
export const pointForCorrectFilter = 10
export const bonusPoint = 1
export const strictFailurePoint = -1 // if a filter is strict then the points for the course are set to -1 and later filtered out 

//used in cases where we want to make a filter extra effective
export const extraRewardPoints = 5






