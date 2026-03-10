import User from './models/user.ts'
import Organisation from './models/organisation.ts'
import Cu from './models/cu.ts'
import Cur from './models/cur.ts'
import CurCu from './models/curCu.ts'
import StudyRight from './models/studyRight.ts'
import Enrolment from './models/enrolment.ts'
import logger from '../util/logger.ts'

/**
 * Wipes all data from the database in the correct order to respect foreign key constraints
 */
async function wipeDatabase() {
  logger.info('Wiping database tables...')
  
  await Enrolment.destroy({ where: {}, truncate: true, cascade: true })
  await CurCu.destroy({ where: {}, truncate: true, cascade: true })
  await Cur.destroy({ where: {}, truncate: true, cascade: true })
  await Cu.destroy({ where: {}, truncate: true, cascade: true })
  await StudyRight.destroy({ where: {}, truncate: true, cascade: true })
  await User.destroy({ where: {}, truncate: true, cascade: true })
  await Organisation.destroy({ where: {}, truncate: true, cascade: true })
  
  logger.info('Database tables wiped')
}

/**
 * Seeds the test user (same as mock_user.ts)
 */
async function seedUsers() {
  logger.info('Seeding users...')
  
  await User.create({
    id: 'e2e-test-user-001',
    username: 'hy-hlo-testuser',
    firstNames: 'Testi',
    lastName: 'Kayttaja',
    language: 'fi',
    hyGroupCn: ['grp-toska', 'hy-kielikeskus-employees'],
    studentNumber: '012345678',
  } as any)
  
  logger.info('Users seeded')
}

// ── Shared types ─────────────────────────────────────────────────────────────

type LocalizedName = { fi: string; en: string; sv: string }
type Credits = { min: number; max: number }

// ── URN helpers ───────────────────────────────────────────────────────────────

const URN = 'urn:code:custom:hy-university-root-id'

const apparaattiUrns = (...tags: string[]) => ({
  [`${URN}:kk-apparaatti`]: tags.map((t) => `${URN}:kk-apparaatti:${t}`),
})

const langUrns = (...langs: string[]) => ({
  [`${URN}:opetuskielet`]: langs.map((l) => `${URN}:opetuskielet:${l}`),
})

const helsinkiUrns = (...cats: string[]) => ({
  [`${URN}:helsinki_fi`]: cats.map((c) => `${URN}:helsinki_fi:${c}`),
})

const opinfiUrns = (...cats: string[]) => ({
  [`${URN}:opinfi-luokittelu`]: cats.map((c) => `${URN}:opinfi-luokittelu:${c}`),
})

// ── Object factories ──────────────────────────────────────────────────────────

const PARENT = {
  main:     'hy-org-2024-03-27-5',
  root:     'hy-university-root-id',
  svenska:  'hy-org-2024-03-27-1',
  medpsych: 'hy-org-1000000865',
}

function makeOrg(id: string, code: string, name: LocalizedName, parentId: string) {
  return { id, code, name, parentId }
}

function makeCourse(
  id: string,
  courseCode: string,
  name: LocalizedName,
  groupId: string,
  credits: Credits,
  customCodeUrns: Record<string, string[]>
) {
  return { id: `hy-cu-e2e-${id}`, courseCode, name, groupId, credits, customCodeUrns }
}

function makeRealization(id: string, name: LocalizedName, nameSpecifier: LocalizedName, startDate: Date, endDate: Date, typeUrn: string, customCodeUrns: Record<string, string[]>) {
  return { id, name, nameSpecifier, startDate, endDate, courseUnitRealisationTypeUrn: typeUrn, customCodeUrns }
}

function makeCurCu(curId: string, cuId: string) {
  return { curId, cuId }
}

// ── Org shorthands ────────────────────────────────────────────────────────────

const ORG = {
  science:  'hy-org-1000000911', // H50
  bio:      'hy-org-46074265',   // H57
  social:   'hy-org-1000000940', // H70
  psych:    'hy-org-1001800687', // 414
  law:      'hy-org-1000000821', // H20
  medicine: 'hy-org-1000000836', // H30
  language: 'hy-org-1000003401', // H930
}

/**
 * Seeds organisations matching production data structure
 */
async function seedOrganisations() {
  logger.info('Seeding organisations...')

  const organisations = [
    makeOrg('hy-org-1000000580', 'H10',   { fi: 'Teologinen tiedekunta',                        en: 'Faculty of Theology',                           sv: 'Teologiska fakulteten'                              }, PARENT.main),
    makeOrg('hy-org-1000000821', 'H20',   { fi: 'Oikeustieteellinen tiedekunta',                en: 'Faculty of Law',                                sv: 'Juridiska fakulteten'                               }, PARENT.main),
    makeOrg('hy-org-1000000836', 'H30',   { fi: 'Lääketieteellinen tiedekunta',                 en: 'Faculty of Medicine',                           sv: 'Medicinska fakulteten'                              }, PARENT.main),
    makeOrg('hy-org-1000000842', 'H40',   { fi: 'Humanistinen tiedekunta',                      en: 'Faculty of Humanities',                         sv: 'Humanistiska fakulteten'                            }, PARENT.main),
    makeOrg('hy-org-1000000911', 'H50',   { fi: 'Matemaattis-luonnontieteellinen tiedekunta',   en: 'Faculty of Science',                            sv: 'Matematisk-naturvetenskapliga fakulteten'           }, PARENT.main),
    makeOrg('hy-org-41547372',   'H55',   { fi: 'Farmasian tiedekunta',                         en: 'Faculty of Pharmacy',                           sv: 'Farmaceutiska fakulteten'                           }, PARENT.main),
    makeOrg('hy-org-46074265',   'H57',   { fi: 'Bio- ja ympäristötieteellinen tiedekunta',     en: 'Faculty of Biological and Environmental Sciences', sv: 'Bio- och miljövetenskapliga fakulteten'           }, PARENT.main),
    makeOrg('hy-org-1000000939', 'H60',   { fi: 'Kasvatustieteellinen tiedekunta',              en: 'Faculty of Educational Sciences',               sv: 'Pedagogiska fakulteten'                             }, PARENT.main),
    makeOrg('hy-org-1000000940', 'H70',   { fi: 'Valtiotieteellinen tiedekunta',                en: 'Faculty of Social Sciences',                    sv: 'Statsvetenskapliga fakulteten'                      }, PARENT.main),
    makeOrg('hy-org-1000000957', 'H74',   { fi: 'Svenska social- och kommunalhögskolan',        en: 'Swedish School of Social Science',              sv: 'Svenska social- och kommunalhögskolan'              }, PARENT.svenska),
    makeOrg('hy-org-1000000941', 'H80',   { fi: 'Maatalous-metsätieteellinen tiedekunta',       en: 'Faculty of Agriculture and Forestry',           sv: 'Agrikultur-forstvetenskapliga fakulteten'           }, PARENT.main),
    makeOrg('hy-org-1001813360', 'H90',   { fi: 'Eläinlääketieteellinen tiedekunta',            en: 'Faculty of Veterinary Medicine',                sv: 'Veterinärmedicinska fakulteten'                     }, PARENT.main),
    makeOrg('hy-org-1000000855', 'H305',  { fi: 'Hammaslääketieteen laitos',                    en: 'Institute of Dentistry',                        sv: 'Institutionen för odontologi'                       }, PARENT.root),
    makeOrg('hy-org-1001800687', '414',   { fi: 'Psykologian laitos',                           en: 'Department of Psychology',                      sv: 'Psykologiska institutionen'                         }, PARENT.root),
    makeOrg('hy-org-1001800688', '4141',  { fi: 'Soveltava psykologia',                         en: 'Division of Applied Psychology',                sv: 'Avdelningen för tillämpad psykologi'                }, PARENT.root),
    makeOrg('hy-org-115968345',  'H3456', { fi: 'Psykologian ja logopedian osasto',             en: 'Department of Psychology and Logopedics',       sv: 'Avdelningen för psykologi och logopedi'             }, PARENT.medpsych),
    makeOrg('hy-org-1000003401', 'H930',  { fi: 'Kielikeskus',                                  en: 'Language Centre',                               sv: 'Språkcentrum'                                       }, PARENT.root),
  ]

  await Organisation.bulkCreate(organisations as any)

  logger.info(`Seeded ${organisations.length} organisations`)
}

/**
 * Seeds course units (Cu)
 */
async function seedCourses() {
  logger.info('Seeding courses...')

  const courses = [
    // Computer Science (H50 - Science)
    makeCourse('tkt10001', 'TKT10001', { fi: 'Ohjelmoinnin perusteet',        en: 'Introduction to Programming',    sv: 'Grunderna i programmering'      }, ORG.science,  { min: 5,  max: 5  }, { ...apparaattiUrns('kkt-mat'), ...langUrns('fi'),     ...helsinkiUrns('luonnontieteet') }),
    makeCourse('tkt10002', 'TKT10002', { fi: 'Tietorakenteet ja algoritmit',   en: 'Data Structures and Algorithms', sv: 'Datastrukturer och algoritmer'   }, ORG.science,  { min: 10, max: 10 }, { ...apparaattiUrns('kkt-mat'), ...langUrns('en'),     ...helsinkiUrns('luonnontieteet') }),
    makeCourse('tkt10003', 'TKT10003', { fi: 'Web-ohjelmointi',                en: 'Web Development',                sv: 'Webbutveckling'                  }, ORG.science,  { min: 5,  max: 5  }, { ...apparaattiUrns('kkt-mat'), ...opinfiUrns('opinfi-luokittelu-online'), ...helsinkiUrns('luonnontieteet') }),

    // Mathematics (H50 - Science)
    makeCourse('mat11001', 'MAT11001', { fi: 'Analyysi I',                     en: 'Calculus I',                     sv: 'Analys I'                        }, ORG.science,  { min: 10, max: 10 }, { ...apparaattiUrns('kkt-mat'), ...langUrns('fi'),     ...helsinkiUrns('luonnontieteet') }),
    makeCourse('mat11002', 'MAT11002', { fi: 'Lineaarialgebra',                 en: 'Linear Algebra',                 sv: 'Linjär algebra'                  }, ORG.science,  { min: 10, max: 10 }, { ...apparaattiUrns('kkt-mat'), ...langUrns('fi'),     ...helsinkiUrns('luonnontieteet') }),

    // Language courses (H930 - Kielikeskus)
    // English 4-tier sort order (en-secondary users):
    // 1. Specific  (KK-RUMALU)   – no trailing digits, non-KAIKKI → highest bonus
    // 2. KAIKKI    (KK-ENKAIKKI) – code contains "KAIKKI"         → second bonus
    // 3. Numbered  (KK-ENG201)   – code ends in digits             → third bonus
    // 4. ERI       (KK-ENERI)    – challenge course (kks-kor URN)  → lowest bonus
    makeCourse('kk-rumalu',   'KK-RUMALU',   { fi: 'Toisen kotimaisen kielen suullinen ja kirjallinen taito, ruotsi (CEFR B1)', en: 'Oral and Written Skills in the Second National Language, Swedish (CEFR B1)', sv: 'Muntlig och skriftlig färdighet i det andra inhemska språket, svenska (CEFR B1)' }, ORG.language, { min: 2, max: 2 }, { ...langUrns('sv'),      ...helsinkiUrns('kielet') }),
    makeCourse('kk-enkaikki', 'KK-ENKAIKKI', { fi: 'Englanti kaikille',         en: 'English for Everyone',           sv: 'Engelska för alla'               }, ORG.language, { min: 3, max: 3 }, { ...langUrns('en'),      ...helsinkiUrns('kielet') }),
    makeCourse('kk-eng201',   'KK-ENG201',   { fi: 'Akateeminen englanti',       en: 'Academic English',               sv: 'Akademisk engelska'              }, ORG.language, { min: 5, max: 5 }, { ...langUrns('en'),      ...helsinkiUrns('kielet') }),
    makeCourse('kk-eneri',    'KK-ENERI',    { fi: 'Englanti erityistarpeisiin', en: 'English for Special Purposes',   sv: 'Engelska för särskilda ändamål'  }, ORG.language, { min: 3, max: 3 }, { ...apparaattiUrns('kks-kor'), ...langUrns('en'), ...helsinkiUrns('kielet') }),

    // Swedish 4-tier sort order for matlu (sv-secondary users, KK-RUMALU already serves tier 1):
    // 1. Specific  (KK-RUMALU)   – already above
    // 2. KAIKKI    (KK-RUKAIKKI) – code contains "KAIKKI"         → second bonus
    // 3. Numbered  (KK-RUO205)   – code ends in digits             → third bonus
    // 4. ERI       (KK-RUERI)    – challenge course (sv-secondary code match) → lowest bonus
    makeCourse('kk-rukaikki', 'KK-RUKAIKKI', { fi: 'Ruotsi kaikille',            en: 'Swedish for Everyone',           sv: 'Svenska för alla'                }, ORG.language, { min: 3, max: 3 }, { ...langUrns('sv'),      ...helsinkiUrns('kielet') }),
    makeCourse('kk-ruo205',   'KK-RUO205',   { fi: 'Repetera svenska - Ruotsin perusrakenteiden ja sanaston kertausta (CEFR A2)', en: 'Repetera svenska - Remedial course in Swedish (CEFR A2)', sv: 'Repetera svenska (CEFR A2)' }, ORG.language, { min: 2, max: 2 }, { ...langUrns('fi', 'sv'), ...helsinkiUrns('kielet') }),
    makeCourse('kk-rueri',    'KK-RUERI',    { fi: 'Ruotsi erityistarpeisiin',    en: 'Swedish for Special Purposes',   sv: 'Svenska för särskilda ändamål'   }, ORG.language, { min: 3, max: 3 }, { ...langUrns('sv'),      ...helsinkiUrns('kielet') }),

    // Other faculties
    makeCourse('fys1001', 'FYS1001', { fi: 'Fysiikka I',              en: 'Physics I',                  sv: 'Fysik I'                   }, ORG.science,  { min: 10, max: 10 }, { ...apparaattiUrns('kkt-mat'), ...langUrns('fi'), ...helsinkiUrns('luonnontieteet') }),
    makeCourse('kem1001', 'KEM1001', { fi: 'Kemian perusteet',         en: 'Chemistry Basics',           sv: 'Grunderna i kemi'          }, ORG.science,  { min: 5,  max: 5  }, { ...apparaattiUrns('kkt-mat'), ...langUrns('fi'), ...helsinkiUrns('luonnontieteet') }),
    makeCourse('bio1001', 'BIO1001', { fi: 'Biologian perusteet',      en: 'Biology Fundamentals',       sv: 'Biologins grunder'         }, ORG.bio,      { min: 5,  max: 5  }, { ...apparaattiUrns('kkt-bio'), ...langUrns('fi'), ...helsinkiUrns('luonnontieteet') }),
    makeCourse('tal1001', 'TAL1001', { fi: 'Taloustieteen johdanto',   en: 'Introduction to Economics',  sv: 'Introduktion till ekonomi' }, ORG.social,   { min: 5,  max: 5  }, { ...apparaattiUrns('kkt-val'), ...langUrns('fi'), ...helsinkiUrns('yhteiskunta')   }),
    makeCourse('psy1001', 'PSY1001', { fi: 'Psykologia 101',           en: 'Psychology 101',             sv: 'Psykologi 101'             }, ORG.psych,    { min: 5,  max: 5  }, { ...apparaattiUrns('kkt-hum'), ...langUrns('fi') }),
    makeCourse('oik1001', 'OIK1001', { fi: 'Oikeustieteen perusteet',  en: 'Introduction to Law',        sv: 'Introduktion till juridik' }, ORG.law,      { min: 5,  max: 5  }, { ...apparaattiUrns('kkt-oik'), ...langUrns('fi') }),
    makeCourse('laa1001', 'LAA1001', { fi: 'Lääketieteen perusteet',   en: 'Introduction to Medicine',   sv: 'Introduktion till medicin' }, ORG.medicine, { min: 10, max: 10 }, { ...apparaattiUrns('kkt-laa'), ...langUrns('fi') }),

    // Special attribute courses
    makeCourse('mat-grad', 'MAT-GRAD', { fi: 'Matematiikka valmistuville', en: 'Mathematics for Graduating Students', sv: 'Matematik för examinander' }, ORG.science, { min: 5, max: 5 }, { ...apparaattiUrns('kkt-mat', 'kks-val'), ...langUrns('fi'), ...helsinkiUrns('luonnontieteet') }),
    makeCourse('tkt-mooc', 'TKT-MOOC', { fi: 'Ohjelmointi MOOC',          en: 'Programming MOOC',                   sv: 'Programmering MOOC'        }, ORG.science, { min: 5, max: 5 }, { ...apparaattiUrns('kkt-mat'), ...opinfiUrns('opinfi-luokittelu-online'), ...helsinkiUrns('luonnontieteet') }),
  ]

  await Cu.bulkCreate(courses as any)

  logger.info(`Seeded ${courses.length} courses`)
  return courses
}

// ── Realization constants ─────────────────────────────────────────────────────

const typeUrns = [
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-blended',
  'urn:code:course-unit-realisation-type:teaching-participation-contact',
  'urn:code:course-unit-realisation-type:teaching-participation-distance',
  'urn:code:course-unit-realisation-type:exam-exam',
]

const nameSpecifiers: LocalizedName[] = [
  { fi: 'Lähiopetus',      en: 'Contact teaching', sv: 'Kontaktundervisning'   },
  { fi: 'Verkko-opetus',   en: 'Online teaching',  sv: 'Nätundervisning'       },
  { fi: 'Monimuoto-opetus',en: 'Blended teaching', sv: 'Flerformsundervisning' },
  { fi: 'Etäopetus',       en: 'Distance teaching',sv: 'Distansundervisning'   },
  { fi: 'Tentti',          en: 'Exam',             sv: 'Tentamen'              },
]

// Semesters: Fall 2025, Spring 2026, Fall 2026, Spring 2027, Fall 2027
const semesters = [
  { name: 'Fall 2025',   startDate: new Date('2025-09-01'), endDate: new Date('2025-12-20') },
  { name: 'Spring 2026', startDate: new Date('2026-01-12'), endDate: new Date('2026-05-31') },
  { name: 'Fall 2026',   startDate: new Date('2026-09-01'), endDate: new Date('2026-12-20') },
  { name: 'Spring 2027', startDate: new Date('2027-01-11'), endDate: new Date('2027-05-31') },
  { name: 'Fall 2027',   startDate: new Date('2027-09-01'), endDate: new Date('2027-12-20') },
]

/**
 * Seeds course realizations (Cur) for years 2025-2027
 */
async function seedCourseRealizations(courses: any[]) {
  logger.info('Seeding course realizations...')

  const realizations: any[] = []

  courses.forEach((course, courseIndex) => {
    // Popular courses (languages, CS basics) get 3 realizations, others get 2
    const numRealizations = courseIndex < 8 ? 3 : 2

    for (let i = 0; i < numRealizations; i++) {
      const semester = semesters[i]
      let urns = { ...course.customCodeUrns }

      // Add graduating-student tag to some spring science courses
      if (semester.name.includes('Spring') && i === 1 && course.groupId === ORG.science) {
        urns = { ...urns, [`${URN}:kk-apparaatti`]: [...(urns[`${URN}:kk-apparaatti`] || []), `${URN}:kk-apparaatti:kks-val`] }
      }
      // Add integrated tag to the third realization of language courses
      if (course.courseCode.startsWith('KK-') && i === 2) {
        urns = { ...urns, [`${URN}:kk-apparaatti`]: [...(urns[`${URN}:kk-apparaatti`] || []), `${URN}:kk-apparaatti:kks-int`] }
      }

      realizations.push(makeRealization(
        `${course.id}-cur-${i + 1}`,
        course.name,
        nameSpecifiers[i % nameSpecifiers.length],
        semester.startDate,
        semester.endDate,
        typeUrns[i % typeUrns.length],
        urns,
      ))
    }
  })

  await Cur.bulkCreate(realizations)

  logger.info(`Seeded ${realizations.length} course realizations`)
  return realizations
}

/**
 * Seeds CurCu relations (many-to-many between Cur and Cu)
 */
async function seedCurCuRelations(realizations: any[]) {
  logger.info('Seeding CurCu relations...')

  // Derive CU id by stripping the trailing '-cur-N' suffix
  const relations = realizations.map((r) =>
    makeCurCu(r.id, r.id.substring(0, r.id.lastIndexOf('-cur-')))
  )

  await CurCu.bulkCreate(relations)

  logger.info(`Seeded ${relations.length} CurCu relations`)
}

/**
 * Main seed function that orchestrates all seeding
 */
export async function seedDatabase() {
  try {
    logger.info('Starting E2E database seeding...')
    
    await wipeDatabase()
    await seedUsers()
    await seedOrganisations()
    const courses = await seedCourses()
    const realizations = await seedCourseRealizations(courses)
    await seedCurCuRelations(realizations)
    
    logger.info('E2E database seeding completed')
  } catch (error: any) {
    logger.error('E2E database seeding failed:', error)
    throw error
  }
}
