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

/**
 * Seeds organisations matching production data structure
 */
async function seedOrganisations() {
  logger.info('Seeding organisations...')
  
  const organisations = [
    {
      id: 'hy-org-1000000580',
      name: { fi: 'Teologinen tiedekunta', en: 'Faculty of Theology', sv: 'Teologiska fakulteten' },
      code: 'H10',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-1000000821',
      name: { fi: 'Oikeustieteellinen tiedekunta', en: 'Faculty of Law', sv: 'Juridiska fakulteten' },
      code: 'H20',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-1000000836',
      name: { fi: 'Lääketieteellinen tiedekunta', en: 'Faculty of Medicine', sv: 'Medicinska fakulteten' },
      code: 'H30',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-1000000842',
      name: { fi: 'Humanistinen tiedekunta', en: 'Faculty of Humanities', sv: 'Humanistiska fakulteten' },
      code: 'H40',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-1000000911',
      name: { fi: 'Matemaattis-luonnontieteellinen tiedekunta', en: 'Faculty of Science', sv: 'Matematisk-naturvetenskapliga fakulteten' },
      code: 'H50',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-41547372',
      name: { fi: 'Farmasian tiedekunta', en: 'Faculty of Pharmacy', sv: 'Farmaceutiska fakulteten' },
      code: 'H55',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-46074265',
      name: { fi: 'Bio- ja ympäristötieteellinen tiedekunta', en: 'Faculty of Biological and Environmental Sciences', sv: 'Bio- och miljövetenskapliga fakulteten' },
      code: 'H57',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-1000000939',
      name: { fi: 'Kasvatustieteellinen tiedekunta', en: 'Faculty of Educational Sciences', sv: 'Pedagogiska fakulteten' },
      code: 'H60',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-1000000940',
      name: { fi: 'Valtiotieteellinen tiedekunta', en: 'Faculty of Social Sciences', sv: 'Statsvetenskapliga fakulteten' },
      code: 'H70',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-1000000957',
      name: { fi: 'Svenska social- och kommunalhögskolan', en: 'Swedish School of Social Science', sv: 'Svenska social- och kommunalhögskolan' },
      code: 'H74',
      parentId: 'hy-org-2024-03-27-1',
    },
    {
      id: 'hy-org-1000000941',
      name: { fi: 'Maatalous-metsätieteellinen tiedekunta', en: 'Faculty of Agriculture and Forestry', sv: 'Agrikultur-forstvetenskapliga fakulteten' },
      code: 'H80',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-1001813360',
      name: { fi: 'Eläinlääketieteellinen tiedekunta', en: 'Faculty of Veterinary Medicine', sv: 'Veterinärmedicinska fakulteten' },
      code: 'H90',
      parentId: 'hy-org-2024-03-27-5',
    },
    {
      id: 'hy-org-1000000855',
      name: { fi: 'Hammaslääketieteen laitos', en: 'Institute of Dentistry', sv: 'Institutionen för odontologi' },
      code: 'H305',
      parentId: 'hy-university-root-id',
    },
    {
      id: 'hy-org-1001800687',
      name: { fi: 'Psykologian laitos', en: 'Department of Psychology', sv: 'Psykologiska institutionen' },
      code: '414',
      parentId: 'hy-university-root-id',
    },
    {
      id: 'hy-org-1001800688',
      name: { fi: 'Soveltava psykologia', en: 'Division of Applied Psychology', sv: 'Avdelningen för tillämpad psykologi' },
      code: '4141',
      parentId: 'hy-university-root-id',
    },
    {
      id: 'hy-org-115968345',
      name: { fi: 'Psykologian ja logopedian osasto', en: 'Department of Psychology and Logopedics', sv: 'Avdelningen för psykologi och logopedi' },
      code: 'H3456',
      parentId: 'hy-org-1000000865',
    },
    {
      id: 'hy-org-1000003401',
      name: { fi: 'Kielikeskus', en: 'Language Centre', sv: 'Språkcentrum' },
      code: 'H930',
      parentId: 'hy-university-root-id',
    },
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
    // Computer Science courses (H50 - Science)
    {
      id: 'hy-cu-e2e-tkt10001',
      name: { fi: 'Ohjelmoinnin perusteet', en: 'Introduction to Programming', sv: 'Grunderna i programmering' },
      courseCode: 'TKT10001',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-1000000911',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-mat'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
    {
      id: 'hy-cu-e2e-tkt10002',
      name: { fi: 'Tietorakenteet ja algoritmit', en: 'Data Structures and Algorithms', sv: 'Datastrukturer och algoritmer' },
      courseCode: 'TKT10002',
      credits: { min: 10, max: 10 },
      groupId: 'hy-org-1000000911',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-mat'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:en'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
    {
      id: 'hy-cu-e2e-tkt10003',
      name: { fi: 'Web-ohjelmointi', en: 'Web Development', sv: 'Webbutveckling' },
      courseCode: 'TKT10003',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-1000000911',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-mat'],
        'urn:code:custom:hy-university-root-id:opinfi-luokittelu': ['urn:code:custom:hy-university-root-id:opinfi-luokittelu:opinfi-luokittelu-online'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
    
    // Mathematics courses (H50 - Science)
    {
      id: 'hy-cu-e2e-mat11001',
      name: { fi: 'Analyysi I', en: 'Calculus I', sv: 'Analys I' },
      courseCode: 'MAT11001',
      credits: { min: 10, max: 10 },
      groupId: 'hy-org-1000000911',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-mat'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
    {
      id: 'hy-cu-e2e-mat11002',
      name: { fi: 'Lineaarialgebra', en: 'Linear Algebra', sv: 'Linjär algebra' },
      courseCode: 'MAT11002',
      credits: { min: 10, max: 10 },
      groupId: 'hy-org-1000000911',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-mat'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
    
    // Language courses (Kielikeskus - H930)
    {
      id: 'hy-cu-e2e-kk-rumalu',
      name: { fi: 'Toisen kotimaisen kielen suullinen ja kirjallinen taito, ruotsi (CEFR B1)', en: 'Oral and Written Skills in the Second National Language, Swedish (CEFR B1)', sv: 'Muntlig och skriftlig färdighet i det andra inhemska språket, svenska (CEFR B1)' },
      courseCode: 'KK-RUMALU',
      credits: { min: 2, max: 2 },
      groupId: 'hy-org-1000003401',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:sv'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:kielet'],
      },
    },
    {
      id: 'hy-cu-e2e-kk-ruo205',
      name: { fi: 'Repetera svenska - Ruotsin perusrakenteiden ja sanaston kertausta (CEFR A2)', en: 'Repetera svenska - Remedial course in Swedish (CEFR A2)', sv: 'Repetera svenska (CEFR A2)' },
      courseCode: 'KK-RUO205',
      credits: { min: 2, max: 2 },
      groupId: 'hy-org-1000003401',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi', 'urn:code:custom:hy-university-root-id:opetuskielet:sv'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:kielet'],
      },
    },
    {
      id: 'hy-cu-e2e-kk-eng201',
      name: { fi: 'Akateeminen englanti', en: 'Academic English', sv: 'Akademisk engelska' },
      courseCode: 'KK-ENG201',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-1000003401',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:en'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:kielet'],
      },
    },
    
    // Physics (H50 - Science)
    {
      id: 'hy-cu-e2e-fys1001',
      name: { fi: 'Fysiikka I', en: 'Physics I', sv: 'Fysik I' },
      courseCode: 'FYS1001',
      credits: { min: 10, max: 10 },
      groupId: 'hy-org-1000000911',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-mat'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
    
    // Chemistry (H50 - Science)
    {
      id: 'hy-cu-e2e-kem1001',
      name: { fi: 'Kemian perusteet', en: 'Chemistry Basics', sv: 'Grunderna i kemi' },
      courseCode: 'KEM1001',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-1000000911',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-mat'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
    
    // Biology (H57 - Bio and Environmental)
    {
      id: 'hy-cu-e2e-bio1001',
      name: { fi: 'Biologian perusteet', en: 'Biology Fundamentals', sv: 'Biologins grunder' },
      courseCode: 'BIO1001',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-46074265',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-bio'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
    
    // Social Sciences (H70)
    {
      id: 'hy-cu-e2e-tal1001',
      name: { fi: 'Taloustieteen johdanto', en: 'Introduction to Economics', sv: 'Introduktion till ekonomi' },
      courseCode: 'TAL1001',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-1000000940',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-val'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:yhteiskunta'],
      },
    },
    
    // Psychology (414)
    {
      id: 'hy-cu-e2e-psy1001',
      name: { fi: 'Psykologia 101', en: 'Psychology 101', sv: 'Psykologi 101' },
      courseCode: 'PSY1001',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-1001800687',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-hum'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
      },
    },
    
    // Law (H20)
    {
      id: 'hy-cu-e2e-oik1001',
      name: { fi: 'Oikeustieteen perusteet', en: 'Introduction to Law', sv: 'Introduktion till juridik' },
      courseCode: 'OIK1001',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-1000000821',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-oik'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
      },
    },
    
    // Medicine (H30)
    {
      id: 'hy-cu-e2e-laa1001',
      name: { fi: 'Lääketieteen perusteet', en: 'Introduction to Medicine', sv: 'Introduktion till medicin' },
      courseCode: 'LAA1001',
      credits: { min: 10, max: 10 },
      groupId: 'hy-org-1000000836',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-laa'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
      },
    },
    
    // Special course types for testing different attributes
    {
      id: 'hy-cu-e2e-mat-grad',
      name: { fi: 'Matematiikka valmistuville', en: 'Mathematics for Graduating Students', sv: 'Matematik för examinander' },
      courseCode: 'MAT-GRAD',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-1000000911',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-mat', 'urn:code:custom:hy-university-root-id:kk-apparaatti:kks-val'],
        'urn:code:custom:hy-university-root-id:opetuskielet': ['urn:code:custom:hy-university-root-id:opetuskielet:fi'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
    {
      id: 'hy-cu-e2e-tkt-mooc',
      name: { fi: 'Ohjelmointi MOOC', en: 'Programming MOOC', sv: 'Programmering MOOC' },
      courseCode: 'TKT-MOOC',
      credits: { min: 5, max: 5 },
      groupId: 'hy-org-1000000911',
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': ['urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-mat'],
        'urn:code:custom:hy-university-root-id:opinfi-luokittelu': ['urn:code:custom:hy-university-root-id:opinfi-luokittelu:opinfi-luokittelu-online'],
        'urn:code:custom:hy-university-root-id:helsinki_fi': ['urn:code:custom:hy-university-root-id:helsinki_fi:luonnontieteet'],
      },
    },
  ]
  
  await Cu.bulkCreate(courses as any)
  
  logger.info(`Seeded ${courses.length} courses`)
  return courses
}

/**
 * Seeds course realizations (Cur) for years 2025-2027
 */
async function seedCourseRealizations(courses: any[]) {
  logger.info('Seeding course realizations...')
  
  const realizations: any[] = []
  
  // Type URNs to cycle through for variety
  const typeUrns = [
    'urn:code:course-unit-realisation-type:teaching-participation-lectures',
    'urn:code:course-unit-realisation-type:teaching-participation-online',
    'urn:code:course-unit-realisation-type:teaching-participation-blended',
    'urn:code:course-unit-realisation-type:teaching-participation-contact',
    'urn:code:course-unit-realisation-type:teaching-participation-distance',
    'urn:code:course-unit-realisation-type:exam-exam',
  ]
  
  const nameSpecifiers = [
    { fi: 'Lähiopetus', en: 'Contact teaching', sv: 'Kontaktundervisning' },
    { fi: 'Verkko-opetus', en: 'Online teaching', sv: 'Nätundervisning' },
    { fi: 'Monimuoto-opetus', en: 'Blended teaching', sv: 'Flerformsundervisning' },
    { fi: 'Etäopetus', en: 'Distance teaching', sv: 'Distansundervisning' },
    { fi: 'Tentti', en: 'Exam', sv: 'Tentamen' },
  ]
  
  // Semesters: Fall 2025, Spring 2026, Fall 2026, Spring 2027, Fall 2027
  const semesters = [
    { name: 'Fall 2025', startDate: new Date('2025-09-01'), endDate: new Date('2025-12-20') },
    { name: 'Spring 2026', startDate: new Date('2026-01-12'), endDate: new Date('2026-05-31') },
    { name: 'Fall 2026', startDate: new Date('2026-09-01'), endDate: new Date('2026-12-20') },
    { name: 'Spring 2027', startDate: new Date('2027-01-11'), endDate: new Date('2027-05-31') },
    { name: 'Fall 2027', startDate: new Date('2027-09-01'), endDate: new Date('2027-12-20') },
  ]
  
  // Create 2-3 realizations for each course
  courses.forEach((course, courseIndex) => {
    // Popular courses (languages, CS basics) get 3 realizations, others get 2
    const numRealizations = courseIndex < 8 ? 3 : 2
    
    for (let i = 0; i < numRealizations; i++) {
      const semester = semesters[i]
      const typeUrn = typeUrns[i % typeUrns.length]
      const specifierIndex = i % nameSpecifiers.length
      
      // Add special kk-apparaatti codes for some realizations
      let realizationUrns = { ...course.customCodeUrns }
      
      // Add graduating student code to some spring courses
      if (semester.name.includes('Spring') && i === 1 && course.groupId === 'hy-org-1000000911') {
        realizationUrns = {
          ...realizationUrns,
          'urn:code:custom:hy-university-root-id:kk-apparaatti': [
            ...(realizationUrns['urn:code:custom:hy-university-root-id:kk-apparaatti'] || []),
            'urn:code:custom:hy-university-root-id:kk-apparaatti:kks-val',
          ],
        }
      }
      
      // Add integrated course code to some language courses
      if (course.courseCode.startsWith('KK-') && i === 2) {
        realizationUrns = {
          ...realizationUrns,
          'urn:code:custom:hy-university-root-id:kk-apparaatti': [
            ...(realizationUrns['urn:code:custom:hy-university-root-id:kk-apparaatti'] || []),
            'urn:code:custom:hy-university-root-id:kk-apparaatti:kks-int',
          ],
        }
      }
      
      realizations.push({
        id: `${course.id}-cur-${i + 1}`,
        name: {
          fi: `${course.name.fi}`,
          en: `${course.name.en}`,
          sv: `${course.name.sv}`,
        },
        nameSpecifier: nameSpecifiers[specifierIndex],
        startDate: semester.startDate,
        endDate: semester.endDate,
        courseUnitRealisationTypeUrn: typeUrn,
        customCodeUrns: realizationUrns,
      })
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
  
  const relations: any[] = []
  
  // Link each realization to its course unit
  realizations.forEach((realization) => {
    // Extract the course ID from the realization ID
    // Format: hy-cu-e2e-xxx-cur-1 -> hy-cu-e2e-xxx
    const cuId = realization.id.substring(0, realization.id.lastIndexOf('-cur-'))
    
    relations.push({
      curId: realization.id,
      cuId: cuId,
    })
  })
  
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
