

export const organisationCodeToUrn: Record<string, string> = {
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


export const allowedStudyPlaces: string[] = [
  'teaching-participation-remote',
  'teaching-participation-online',
  'teaching-participation-blended',
  'teaching-participation-contact',
] 



