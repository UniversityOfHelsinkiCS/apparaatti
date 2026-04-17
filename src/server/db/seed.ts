import User from './models/user.ts'
import Organisation from './models/organisation.ts'
import Cu from './models/cu.ts'
import Cur from './models/cur.ts'
import CurCu from './models/curCu.ts'
import StudyRight from './models/studyRight.ts'
import Enrolment from './models/enrolment.ts'
import logger from '../util/logger.ts'

async function wipeDatabase() {
  logger.info(LOG.wipingDb)
  
  await Enrolment.destroy({ where: {}, truncate: true, cascade: true })
  await CurCu.destroy({ where: {}, truncate: true, cascade: true })
  await Cur.destroy({ where: {}, truncate: true, cascade: true })
  await Cu.destroy({ where: {}, truncate: true, cascade: true })
  await StudyRight.destroy({ where: {}, truncate: true, cascade: true })
  await User.destroy({ where: {}, truncate: true, cascade: true })
  await Organisation.destroy({ where: {}, truncate: true, cascade: true })
  
  logger.info(LOG.dbWiped)
}

async function seedUsers() {
  logger.info(LOG.seedingUsers)
  
  await User.create(TEST_USER as any)
  
  logger.info(LOG.usersSeeded)
}

type LocalizedName = { fi: string; en: string; sv: string }
type Credits = { min: number; max: number }

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
  return { id: `${CU_ID_PREFIX}${id}`, courseCode, name, groupId, credits, customCodeUrns }
}

function makeRealization(id: string, name: LocalizedName, nameSpecifier: LocalizedName, startDate: Date, endDate: Date, typeUrn: string, customCodeUrns: Record<string, string[]>) {
  return { id, name, nameSpecifier, startDate, endDate, courseUnitRealisationTypeUrn: typeUrn, customCodeUrns }
}

function makeCurCu(curId: string, cuId: string) {
  return { curId, cuId }
}

const LOG = {
  wipingDb:            'Wiping database tables...',
  dbWiped:             'Database tables wiped',
  seedingUsers:        'Seeding users...',
  usersSeeded:         'Users seeded',
  seedingOrgs:         'Seeding organisations...',
  seedingCourses:      'Seeding courses...',
  seedingRealizations: 'Seeding course realizations...',
  seedingCurCu:        'Seeding CurCu relations...',
  seedingStarted:      'Starting E2E database seeding...',
  seedingCompleted:    'E2E database seeding completed',
  seedingFailed:       'E2E database seeding failed:',
}

const TEST_USER = {
  id:            'e2e-test-user-001',
  username:      'hy-hlo-testuser',
  firstNames:    'Testi',
  lastName:      'Kayttaja',
  language:      'fi',
  hyGroupCn:     ['grp-toska', 'hy-kielikeskus-employees'],
  studentNumber: '012345678',
}

const TAG = {
  kktMat: 'kkt-mat',
  kktBio: 'kkt-bio',
  kktVal: 'kkt-val',
  kktHum: 'kkt-hum',
  kktOik: 'kkt-oik',
  kktLaa: 'kkt-laa',
  kksVal: 'kks-val',
  kksKor: 'kks-kor',
  kksInt: 'kks-int',
  kksAlm: 'kks-alm',
}

const LANG = { fi: 'fi', en: 'en', sv: 'sv' }

const HKI = {
  luonnontieteet: 'luonnontieteet',
  kielet:         'kielet',
  yhteiskunta:    'yhteiskunta',
}

const OPINFI = { online: 'opinfi-luokittelu-online' }

const CU_ID_PREFIX   = 'hy-cu-e2e-'
const CUR_INFIX      = '-cur-'
const KK_CODE_PREFIX = 'KK-'
const SPRING_LABEL   = 'Spring'

const ORG = {
  theology:  'hy-org-1000000580', // H10
  law:       'hy-org-1000000821', // H20
  medicine:  'hy-org-1000000836', // H30
  humanities:'hy-org-1000000842', // H40
  science:   'hy-org-1000000911', // H50
  pharmacy:  'hy-org-41547372',   // H55
  bio:       'hy-org-46074265',   // H57
  education: 'hy-org-1000000939', // H60
  social:    'hy-org-1000000940', // H70
  soc74:     'hy-org-1000000957', // H74
  agri:      'hy-org-1000000941', // H80
  vet:       'hy-org-1001813360', // H90
  dentistry: 'hy-org-1000000855', // H305
  psych:     'hy-org-1001800687', // 414
  applPsych: 'hy-org-1001800688', // 4141
  psychLogo: 'hy-org-115968345',  // H3456
  language:  'hy-org-1000003401', // H930
}

const ORG_NAME: Record<string, LocalizedName> = {
  h10:      { fi: 'Teologinen tiedekunta',                        en: 'Faculty of Theology',                              sv: 'Teologiska fakulteten'                              },
  h20:      { fi: 'Oikeustieteellinen tiedekunta',                en: 'Faculty of Law',                                   sv: 'Juridiska fakulteten'                               },
  h30:      { fi: 'Lääketieteellinen tiedekunta',                 en: 'Faculty of Medicine',                              sv: 'Medicinska fakulteten'                              },
  h40:      { fi: 'Humanistinen tiedekunta',                      en: 'Faculty of Humanities',                            sv: 'Humanistiska fakulteten'                            },
  h50:      { fi: 'Matemaattis-luonnontieteellinen tiedekunta',   en: 'Faculty of Science',                               sv: 'Matematisk-naturvetenskapliga fakulteten'           },
  h55:      { fi: 'Farmasian tiedekunta',                         en: 'Faculty of Pharmacy',                              sv: 'Farmaceutiska fakulteten'                           },
  h57:      { fi: 'Bio- ja ympäristötieteellinen tiedekunta',     en: 'Faculty of Biological and Environmental Sciences', sv: 'Bio- och miljövetenskapliga fakulteten'             },
  h60:      { fi: 'Kasvatustieteellinen tiedekunta',              en: 'Faculty of Educational Sciences',                  sv: 'Pedagogiska fakulteten'                             },
  h70:      { fi: 'Valtiotieteellinen tiedekunta',                en: 'Faculty of Social Sciences',                       sv: 'Statsvetenskapliga fakulteten'                      },
  h74:      { fi: 'Svenska social- och kommunalhögskolan',        en: 'Swedish School of Social Science',                 sv: 'Svenska social- och kommunalhögskolan'              },
  h80:      { fi: 'Maatalous-metsätieteellinen tiedekunta',       en: 'Faculty of Agriculture and Forestry',              sv: 'Agrikultur-forstvetenskapliga fakulteten'           },
  h90:      { fi: 'Eläinlääketieteellinen tiedekunta',            en: 'Faculty of Veterinary Medicine',                   sv: 'Veterinärmedicinska fakulteten'                     },
  h305:     { fi: 'Hammaslääketieteen laitos',                    en: 'Institute of Dentistry',                           sv: 'Institutionen för odontologi'                       },
  d414:     { fi: 'Psykologian laitos',                           en: 'Department of Psychology',                         sv: 'Psykologiska institutionen'                         },
  d4141:    { fi: 'Soveltava psykologia',                         en: 'Division of Applied Psychology',                   sv: 'Avdelningen för tillämpad psykologi'                },
  h3456:    { fi: 'Psykologian ja logopedian osasto',             en: 'Department of Psychology and Logopedics',          sv: 'Avdelningen för psykologi och logopedi'             },
  h930:     { fi: 'Kielikeskus',                                  en: 'Language Centre',                                  sv: 'Språkcentrum'                                       },
}

async function seedOrganisations() {
  logger.info(LOG.seedingOrgs)

  const organisations = [
    makeOrg(ORG.theology,  'H10',   ORG_NAME.h10,   PARENT.main),
    makeOrg(ORG.law,       'H20',   ORG_NAME.h20,   PARENT.main),
    makeOrg(ORG.medicine,  'H30',   ORG_NAME.h30,   PARENT.main),
    makeOrg(ORG.humanities,'H40',   ORG_NAME.h40,   PARENT.main),
    makeOrg(ORG.science,   'H50',   ORG_NAME.h50,   PARENT.main),
    makeOrg(ORG.pharmacy,  'H55',   ORG_NAME.h55,   PARENT.main),
    makeOrg(ORG.bio,       'H57',   ORG_NAME.h57,   PARENT.main),
    makeOrg(ORG.education, 'H60',   ORG_NAME.h60,   PARENT.main),
    makeOrg(ORG.social,    'H70',   ORG_NAME.h70,   PARENT.main),
    makeOrg(ORG.soc74,     'H74',   ORG_NAME.h74,   PARENT.svenska),
    makeOrg(ORG.agri,      'H80',   ORG_NAME.h80,   PARENT.main),
    makeOrg(ORG.vet,       'H90',   ORG_NAME.h90,   PARENT.main),
    makeOrg(ORG.dentistry, 'H305',  ORG_NAME.h305,  PARENT.root),
    makeOrg(ORG.psych,     '414',   ORG_NAME.d414,  PARENT.root),
    makeOrg(ORG.applPsych, '4141',  ORG_NAME.d4141, PARENT.root),
    makeOrg(ORG.psychLogo, 'H3456', ORG_NAME.h3456, PARENT.medpsych),
    makeOrg(ORG.language,  'H930',  ORG_NAME.h930,  PARENT.root),
  ]

  await Organisation.bulkCreate(organisations as any)

  logger.info(`Seeded ${organisations.length} organisations`)
}

const COURSE_NAME: Record<string, LocalizedName> = {
  tkt10001:   { fi: 'Ohjelmoinnin perusteet',        en: 'Introduction to Programming',    sv: 'Grunderna i programmering'      },
  tkt10002:   { fi: 'Tietorakenteet ja algoritmit',   en: 'Data Structures and Algorithms', sv: 'Datastrukturer och algoritmer'   },
  tkt10003:   { fi: 'Web-ohjelmointi',                en: 'Web Development',                sv: 'Webbutveckling'                  },
  mat11001:   { fi: 'Analyysi I',                     en: 'Calculus I',                     sv: 'Analys I'                        },
  mat11002:   { fi: 'Lineaarialgebra',                 en: 'Linear Algebra',                 sv: 'Linjär algebra'                  },
  kkRumalu:   { fi: 'Toisen kotimaisen kielen suullinen ja kirjallinen taito, ruotsi (CEFR B1)', en: 'Oral and Written Skills in the Second National Language, Swedish (CEFR B1)', sv: 'Muntlig och skriftlig färdighet i det andra inhemska språket, svenska (CEFR B1)' },
  kkEnkaikki: { fi: 'Englanti kaikille',               en: 'English for Everyone',           sv: 'Engelska för alla'               },
  kkEng201:   { fi: 'Akateeminen englanti',             en: 'Academic English',               sv: 'Akademisk engelska'              },
  kkEneri:    { fi: 'Englanti eri kurssi',              en: 'English eri course',             sv: 'Engelska eri kurs'               },
  kkRukaikki: { fi: 'Ruotsi kaikille',                  en: 'Swedish for Everyone',           sv: 'Svenska för alla'                },
  kkRuo205:   { fi: 'Repetera svenska - Ruotsin perusrakenteiden ja sanaston kertausta (CEFR A2)', en: 'Repetera svenska - Remedial course in Swedish (CEFR A2)', sv: 'Repetera svenska (CEFR A2)' },
  kkRueri:    { fi: 'Ruotsi eri kurssi',                en: 'Swedish eri course',             sv: 'Svenska eri kurs'                },
  fys1001:    { fi: 'Fysiikka I',                       en: 'Physics I',                      sv: 'Fysik I'                         },
  kem1001:    { fi: 'Kemian perusteet',                 en: 'Chemistry Basics',               sv: 'Grunderna i kemi'                },
  bio1001:    { fi: 'Biologian perusteet',              en: 'Biology Fundamentals',           sv: 'Biologins grunder'               },
  tal1001:    { fi: 'Taloustieteen johdanto',           en: 'Introduction to Economics',      sv: 'Introduktion till ekonomi'       },
  psy1001:    { fi: 'Psykologia 101',                   en: 'Psychology 101',                 sv: 'Psykologi 101'                   },
  oik1001:    { fi: 'Oikeustieteen perusteet',          en: 'Introduction to Law',            sv: 'Introduktion till juridik'       },
  laa1001:    { fi: 'Lääketieteen perusteet',           en: 'Introduction to Medicine',       sv: 'Introduktion till medicin'       },
  matGrad:    { fi: 'Matematiikka valmistuville',       en: 'Mathematics for Graduating Students', sv: 'Matematik för examinander'  },
  tktMooc:    { fi: 'Ohjelmointi MOOC',                 en: 'Programming MOOC',               sv: 'Programmering MOOC'              },
  h50FiOnline:      { fi: 'Matemaattis-luonnontieteellinen verkkokurssi (fi)', en: 'Science online course (fi)', sv: 'Matematisk-naturvetenskaplig nätkurs (fi)' },
  h50FiContact:     { fi: 'Matemaattis-luonnontieteellinen lähiopetuskurssi (fi)', en: 'Science contact course (fi)', sv: 'Matematisk-naturvetenskaplig närkurs (fi)' },
  h50FiBlended:     { fi: 'Matemaattis-luonnontieteellinen monimuotokurssi (fi)', en: 'Science blended course (fi)', sv: 'Matematisk-naturvetenskaplig blendedkurs (fi)' },
  h50FiIndependent: { fi: 'Matemaattis-luonnontieteellinen itsenäinen opiskelu (fi)', en: 'Science independent study (fi)', sv: 'Matematisk-naturvetenskaplig självständig kurs (fi)' },
  h50FiExam:        { fi: 'Matemaattis-luonnontieteellinen tentti (fi)', en: 'Science exam (fi)', sv: 'Matematisk-naturvetenskaplig tentamen (fi)' },
  h50SvOnline:      { fi: 'Matemaattis-luonnontieteellinen verkkokurssi (sv)', en: 'Science online course (sv)', sv: 'Matematisk-naturvetenskaplig nätkurs (sv)' },
  h50SvContact:     { fi: 'Matemaattis-luonnontieteellinen lähiopetuskurssi (sv)', en: 'Science contact course (sv)', sv: 'Matematisk-naturvetenskaplig närkurs (sv)' },
  h50SvBlended:     { fi: 'Matemaattis-luonnontieteellinen monimuotokurssi (sv)', en: 'Science blended course (sv)', sv: 'Matematisk-naturvetenskaplig blendedkurs (sv)' },
  h50SvIndependent: { fi: 'Matemaattis-luonnontieteellinen itsenäinen opiskelu (sv)', en: 'Science independent study (sv)', sv: 'Matematisk-naturvetenskaplig självständig kurs (sv)' },
  h50SvExam:        { fi: 'Matemaattis-luonnontieteellinen tentti (sv)', en: 'Science exam (sv)', sv: 'Matematisk-naturvetenskaplig tentamen (sv)' },
}

async function seedCourses() {
  logger.info(LOG.seedingCourses)

  const courses = [
    makeCourse('tkt10001', 'TKT10001', COURSE_NAME.tkt10001,   ORG.science,  { min: 5,  max: 5  }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.fi),           ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('tkt10002', 'TKT10002', COURSE_NAME.tkt10002,   ORG.science,  { min: 10, max: 10 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.en),           ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('tkt10003', 'TKT10003', COURSE_NAME.tkt10003,   ORG.science,  { min: 5,  max: 5  }, { ...apparaattiUrns(TAG.kktMat), ...opinfiUrns(OPINFI.online),   ...helsinkiUrns(HKI.luonnontieteet) }),

    makeCourse('mat11001', 'MAT11001', COURSE_NAME.mat11001,   ORG.science,  { min: 10, max: 10 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.fi),           ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('mat11002', 'MAT11002', COURSE_NAME.mat11002,   ORG.science,  { min: 10, max: 10 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.fi),           ...helsinkiUrns(HKI.luonnontieteet) }),

    makeCourse('kk-rumalu',   'KK-RUMALU',   COURSE_NAME.kkRumalu,   ORG.language, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat, TAG.kktHum, TAG.kktVal), ...langUrns(LANG.sv),      ...helsinkiUrns(HKI.kielet) }),
    makeCourse('kk-enkaikki', 'KK-ENKAIKKI', COURSE_NAME.kkEnkaikki, ORG.language, { min: 3, max: 3 }, { ...apparaattiUrns(TAG.kktMat, TAG.kktHum, TAG.kktVal), ...langUrns(LANG.en),      ...helsinkiUrns(HKI.kielet) }),
    makeCourse('kk-eng201',   'KK-ENG201',   COURSE_NAME.kkEng201,   ORG.language, { min: 5, max: 5 }, { ...apparaattiUrns(TAG.kktMat, TAG.kktHum, TAG.kktVal), ...langUrns(LANG.en),      ...helsinkiUrns(HKI.kielet) }),
    makeCourse('kk-eneri',    'KK-ENERI',    COURSE_NAME.kkEneri,    ORG.language, { min: 3, max: 3 }, { ...apparaattiUrns(TAG.kktMat, TAG.kksKor), ...langUrns(LANG.en),           ...helsinkiUrns(HKI.kielet) }),

    makeCourse('kk-rukaikki', 'KK-RUKAIKKI', COURSE_NAME.kkRukaikki, ORG.language, { min: 3, max: 3 }, { ...apparaattiUrns(TAG.kktMat, TAG.kktHum, TAG.kktVal), ...langUrns(LANG.sv),      ...helsinkiUrns(HKI.kielet) }),
    makeCourse('kk-ruo205',   'KK-RUO205',   COURSE_NAME.kkRuo205,   ORG.language, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat, TAG.kktHum, TAG.kktVal), ...langUrns(LANG.fi, LANG.sv), ...helsinkiUrns(HKI.kielet) }),
    makeCourse('kk-rueri',    'KK-RUERI',    COURSE_NAME.kkRueri,    ORG.language, { min: 3, max: 3 }, { ...apparaattiUrns(TAG.kktMat, TAG.kksKor), ...langUrns(LANG.sv),           ...helsinkiUrns(HKI.kielet) }),

    makeCourse('fys1001', 'FYS1001', COURSE_NAME.fys1001, ORG.science,  { min: 10, max: 10 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('kem1001', 'KEM1001', COURSE_NAME.kem1001, ORG.science,  { min: 5,  max: 5  }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('bio1001', 'BIO1001', COURSE_NAME.bio1001, ORG.bio,      { min: 5,  max: 5  }, { ...apparaattiUrns(TAG.kktBio), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('tal1001', 'TAL1001', COURSE_NAME.tal1001, ORG.social,   { min: 5,  max: 5  }, { ...apparaattiUrns(TAG.kktVal), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.yhteiskunta)    }),
    makeCourse('psy1001', 'PSY1001', COURSE_NAME.psy1001, ORG.psych,    { min: 5,  max: 5  }, { ...apparaattiUrns(TAG.kktHum), ...langUrns(LANG.fi) }),
    makeCourse('oik1001', 'OIK1001', COURSE_NAME.oik1001, ORG.law,      { min: 5,  max: 5  }, { ...apparaattiUrns(TAG.kktOik), ...langUrns(LANG.fi) }),
    makeCourse('laa1001', 'LAA1001', COURSE_NAME.laa1001, ORG.medicine, { min: 10, max: 10 }, { ...apparaattiUrns(TAG.kktLaa), ...langUrns(LANG.fi) }),

    makeCourse('mat-grad', 'MAT-GRAD', COURSE_NAME.matGrad, ORG.science, { min: 5, max: 5 }, { ...apparaattiUrns(TAG.kktMat, TAG.kksVal), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('tkt-mooc', 'TKT-MOOC', COURSE_NAME.tktMooc, ORG.science, { min: 5, max: 5 }, { ...apparaattiUrns(TAG.kktMat),            ...opinfiUrns(OPINFI.online), ...helsinkiUrns(HKI.luonnontieteet) }),

    // E2E coverage: ensure H50 has FI and SV courses for every study-place option.
    makeCourse('h50-fi-studyplace-online',      'KK-AIAKVU1OP', COURSE_NAME.h50FiOnline,      ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('h50-fi-studyplace-contact',     'KK-AIAKVU1OP', COURSE_NAME.h50FiContact,     ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('h50-fi-studyplace-blended',     'KK-AIAKVU1OP', COURSE_NAME.h50FiBlended,     ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('h50-fi-studyplace-independent', 'KK-AIAKVU1OP', COURSE_NAME.h50FiIndependent, ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat, TAG.kksAlm), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('h50-fi-studyplace-exam',        'KK-AIAKVU1OP', COURSE_NAME.h50FiExam,        ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.fi), ...helsinkiUrns(HKI.luonnontieteet) }),

    makeCourse('h50-sv-studyplace-online',      'KK-RUMALU', COURSE_NAME.h50SvOnline,      ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.sv), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('h50-sv-studyplace-contact',     'KK-RUMALU', COURSE_NAME.h50SvContact,     ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.sv), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('h50-sv-studyplace-blended',     'KK-RUMALU', COURSE_NAME.h50SvBlended,     ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.sv), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('h50-sv-studyplace-independent', 'KK-RUMALU', COURSE_NAME.h50SvIndependent, ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat, TAG.kksAlm), ...langUrns(LANG.sv), ...helsinkiUrns(HKI.luonnontieteet) }),
    makeCourse('h50-sv-studyplace-exam',        'KK-RUMALU', COURSE_NAME.h50SvExam,        ORG.science, { min: 2, max: 2 }, { ...apparaattiUrns(TAG.kktMat), ...langUrns(LANG.sv), ...helsinkiUrns(HKI.luonnontieteet) }),
  ]

  await Cu.bulkCreate(courses as any)

  logger.info(`Seeded ${courses.length} courses`)
  return courses
}

const typeUrns = [
  'urn:code:course-unit-realisation-type:teaching-participation-lectures',
  'urn:code:course-unit-realisation-type:teaching-participation-online',
  'urn:code:course-unit-realisation-type:teaching-participation-blended',
  'urn:code:course-unit-realisation-type:teaching-participation-contact',
  'urn:code:course-unit-realisation-type:teaching-participation-distance',
  'urn:code:course-unit-realisation-type:exam-exam',
]

const fixedStudyPlaceRealizations: Record<string, { typeUrn: string; nameSpecifier: LocalizedName }> = {
  'h50-fi-studyplace-online': {
    typeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-online',
    nameSpecifier: { fi: 'Verkko-opetus', en: 'Online teaching', sv: 'Nätundervisning' },
  },
  'h50-fi-studyplace-contact': {
    typeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-contact',
    nameSpecifier: { fi: 'Lähiopetus', en: 'Contact teaching', sv: 'Kontaktundervisning' },
  },
  'h50-fi-studyplace-blended': {
    typeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-blended',
    nameSpecifier: { fi: 'Kurssitoteutus', en: 'Course realisation', sv: 'Kursgenomförande' },
  },
  'h50-fi-studyplace-independent': {
    typeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-online',
    nameSpecifier: { fi: 'Itsenäinen opiskelu', en: 'Independent study', sv: 'Självständiga studier' },
  },
  'h50-fi-studyplace-exam': {
    typeUrn: 'urn:code:course-unit-realisation-type:exam-exam',
    nameSpecifier: { fi: 'Kurssitoteutus', en: 'Course realisation', sv: 'Kursgenomförande' },
  },
  'h50-sv-studyplace-online': {
    typeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-online',
    nameSpecifier: { fi: 'Verkko-opetus', en: 'Online teaching', sv: 'Nätundervisning' },
  },
  'h50-sv-studyplace-contact': {
    typeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-contact',
    nameSpecifier: { fi: 'Lähiopetus', en: 'Contact teaching', sv: 'Kontaktundervisning' },
  },
  'h50-sv-studyplace-blended': {
    typeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-blended',
    nameSpecifier: { fi: 'Kurssitoteutus', en: 'Course realisation', sv: 'Kursgenomförande' },
  },
  'h50-sv-studyplace-independent': {
    typeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-online',
    nameSpecifier: { fi: 'Itsenäinen opiskelu', en: 'Independent study', sv: 'Självständiga studier' },
  },
  'h50-sv-studyplace-exam': {
    typeUrn: 'urn:code:course-unit-realisation-type:exam-exam',
    nameSpecifier: { fi: 'Kurssitoteutus', en: 'Course realisation', sv: 'Kursgenomförande' },
  },
}

const nameSpecifiers: LocalizedName[] = [
  { fi: 'Lähiopetus',      en: 'Contact teaching', sv: 'Kontaktundervisning'   },
  { fi: 'Verkko-opetus',   en: 'Online teaching',  sv: 'Nätundervisning'       },
  { fi: 'Monimuoto-opetus',en: 'Blended teaching', sv: 'Flerformsundervisning' },
  { fi: 'Etäopetus',       en: 'Distance teaching',sv: 'Distansundervisning'   },
  { fi: 'Tentti',          en: 'Exam',             sv: 'Tentamen'              },
]

const semesters = [
  { name: 'Fall 2025',   startDate: new Date('2025-09-01'), endDate: new Date('2025-12-20') },
  { name: 'Spring 2026', startDate: new Date('2026-01-12'), endDate: new Date('2026-05-31') },
  { name: 'Fall 2026',   startDate: new Date('2026-09-01'), endDate: new Date('2026-12-20') },
  { name: 'Spring 2027', startDate: new Date('2027-01-11'), endDate: new Date('2027-05-31') },
  { name: 'Fall 2027',   startDate: new Date('2027-09-01'), endDate: new Date('2027-12-20') },
]

async function seedCourseRealizations(courses: any[]) {
  logger.info(LOG.seedingRealizations)

  const realizations: any[] = []

  courses.forEach((course, courseIndex) => {
    const fixedStudyPlaceRealization = fixedStudyPlaceRealizations[course.id]
    if (fixedStudyPlaceRealization) {
      const semester = semesters[0]
      realizations.push(
        makeRealization(
          `${course.id}${CUR_INFIX}1`,
          course.name,
          fixedStudyPlaceRealization.nameSpecifier,
          semester.startDate,
          semester.endDate,
          fixedStudyPlaceRealization.typeUrn,
          { ...course.customCodeUrns }
        )
      )
      return
    }

    const numRealizations = courseIndex < 8 ? 3 : 2

    for (let i = 0; i < numRealizations; i++) {
      const semester = semesters[i]
      let urns = { ...course.customCodeUrns }

      if (semester.name.includes(SPRING_LABEL) && i === 1 && course.groupId === ORG.science) {
        urns = { ...urns, [`${URN}:kk-apparaatti`]: [...(urns[`${URN}:kk-apparaatti`] || []), `${URN}:kk-apparaatti:${TAG.kksVal}`] }
      }
      if (course.courseCode.startsWith(KK_CODE_PREFIX) && i === 2) {
        urns = { ...urns, [`${URN}:kk-apparaatti`]: [...(urns[`${URN}:kk-apparaatti`] || []), `${URN}:kk-apparaatti:${TAG.kksInt}`] }
      }

      realizations.push(makeRealization(
        `${course.id}${CUR_INFIX}${i + 1}`,
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

async function seedCurCuRelations(realizations: any[]) {
  logger.info(LOG.seedingCurCu)

  const relations = realizations.map((r) =>
    makeCurCu(r.id, r.id.substring(0, r.id.lastIndexOf(CUR_INFIX)))
  )

  await CurCu.bulkCreate(relations)

  logger.info(`Seeded ${relations.length} CurCu relations`)
}

import { seedFilters } from './seedFilters.ts'

export async function seedDatabase() {
  try {
    logger.info(LOG.seedingStarted)
    
    await wipeDatabase()
    await seedUsers()
    await seedOrganisations()
    const courses = await seedCourses()
    const realizations = await seedCourseRealizations(courses)
    await seedCurCuRelations(realizations)
    await seedFilters()
    
    logger.info(LOG.seedingCompleted)
  } catch (error: any) {
    logger.error(LOG.seedingFailed, error)
    throw error
  }
}
