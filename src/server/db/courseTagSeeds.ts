import { organisationCodeToUrn } from '../util/constants.ts'

export interface CourseTagSeed {
  key: string
  description: string
}

const FACULTY_TAG_DESCRIPTIONS: Record<string, string> = {
  'kkt-hum': 'Humanistinen tiedekunta',
  'kkt-mat': 'Matemaattis-luonnontieteellinen tiedekunta',
  'kkt-oik': 'Oikeustieteellinen tiedekunta',
  'kkt-teo': 'Teologinen tiedekunta',
  'kkt-ssk': 'Valtiotieteellinen tiedekunta, sosiaalitieteet',
  'kkt-val': 'Valtiotieteellinen tiedekunta',
  'kkt-ela': 'Eläinlääketieteellinen tiedekunta',
  'kkt-kas': 'Kasvatustieteellinen tiedekunta',
  'kkt-bio': 'Bio- ja ympäristötieteellinen tiedekunta',
  'kkt-mm': 'Maatalous-metsätieteellinen tiedekunta',
  'kkt-sps': 'Soveltava psykologia',
  'kkt-ham': 'Humanistinen tiedekunta, Helsingin alue',
  'kkt-laa': 'Lääketieteellinen tiedekunta',
  'kkt-log': 'Logopedia',
  'kkt-psy': 'Psykologia',
  'kkt-far': 'Farmasian tiedekunta',
}

const STUDY_TAG_SEEDS: CourseTagSeed[] = [
  { key: 'kks-kor', description: 'Korvaava: kurssi korvaa pakollisen kieliopintojakson' },
  { key: 'kks-pre', description: 'Valmentava: kurssi valmentaa pakolliseen kieliopintojaksoon' },
  { key: 'kks-muk', description: 'Mukautettu: kurssi on suunnattu erityistä tukea tarvitseville' },
  { key: 'kks-val', description: 'Valmistuville: kurssi sopii valmistumisvaiheen opiskelijalle' },
  { key: 'kks-int', description: 'Integroitu: kieliopinto on integroitu aineopintoihin' },
  { key: 'kks-jou', description: 'Joustava: kurssi on suoritettavissa joustavasti' },
  { key: 'kks-raj', description: 'Rajattu: kurssia ei suositella avoimesti, jätetään suosituksista pois' },
  { key: 'kks-alm', description: 'Almanakka: kurssi näkyy lukuvuosisuunnittelussa' },
  { key: 'kks-mat', description: 'Matemaattis-luonnontieteellinen kohdennus' },
  { key: 'opintotarjonta:mooc', description: 'MOOC: avoin verkkokurssi' },
]

function facultyTagSeeds(): CourseTagSeed[] {
  const urns = [...new Set(Object.values(organisationCodeToUrn))]
  return urns.map(urn => ({ key: urn, description: FACULTY_TAG_DESCRIPTIONS[urn] ?? urn }))
}

export const COURSE_TAG_SEEDS: CourseTagSeed[] = [...STUDY_TAG_SEEDS, ...facultyTagSeeds()]
