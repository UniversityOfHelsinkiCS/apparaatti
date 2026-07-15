export const organisationCodeToUrn: Record<string, string> = {
  H40: 'kkt-hum',
  H50: 'kkt-mat',
  H20: 'kkt-oik',
  H10: 'kkt-teo',
  H74: 'kkt-ssk',
  H70: 'kkt-val',
  H90: 'kkt-ela',
  H60: 'kkt-kas', //kasvatustieteel.
  H57: 'kkt-bio',
  H80: 'kkt-mm', //maa metsa
  '4141': 'kkt-sps', //soveltava spykologia
  H305: 'kkt-ham',
  H30: 'kkt-laa',
  H3456: 'kkt-log', //logopedia seems to have multiple entries in organisations with the same name
  '414': 'kkt-psy',
  H55: 'kkt-far',
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
  online: ['teaching-participation-remote', 'teaching-participation-online', 'teaching-participation-distance'],
  contact: ['teaching-participation-contact'],
  blended: ['teaching-participation-blended'],
}

// Organisation names that indicate collaboration courses
export const collaborationOrganisationNames: string[] = ['Vaasa']

export const collaborationOrganisationCourseNameIncludes: string[] = ['työväen akatemia', 'laajasalon opisto']
