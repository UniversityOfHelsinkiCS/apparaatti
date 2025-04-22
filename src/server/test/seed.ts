import Cu from "../db/models/cu.ts"
import Cur from "../db/models/cur.ts"
import CurCu from "../db/models/curCu.ts"
import Enrolment from "../db/models/enrolment.ts"
import User from "../db/models/user.ts"

export const seed = async () => {
  await Enrolment.destroy({
    where: {},
  })
  await User.destroy({
    where: {},
  })
  await CurCu.destroy({
    where: {},
  })
  await Cur.destroy({
    where: {},
  })
  await Cu.destroy({
    where: {},
  })

  await seedUsers()
  await seedCurs()
  await seedCus()
  await seedEnrolments()
  await seedCurCus()

  console.log('Seeding completed')
}

const seedUsers = async () => {
  await User.bulkCreate([
    {
      id: '1',
      username: 'vesuvesu',
      language: 'fi',
    },
    {
      id: '2',
      username: 'szmatias',
      language: 'sv',
    }
  ])
}

const seedCurs = async () => {
  await Cur.bulkCreate([
    {
      id: '1',
      name: { 
        fi: 'E-urheilun perusteet - Luento-opetus', 
        en: 'Introduction to E-sports - Lectures',
        sv: 'E-sportens grunder - Föreläsningar'
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-01'),
    },
    {
      id: '2',
      name: { 
        fi: 'E-urheilun syventävät opinnot - Luento-opetus', 
        en: 'Advanced E-sports Studies - Lectures',
        sv: 'Avancerade studier i e-sport - Föreläsningar'
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-01'),
    },
  ])
}

const seedEnrolments = async () => {
  await Enrolment.bulkCreate([
    {
      userId: '1',
      courseRealisationId: '1',
    },
    {
      userId: '1',
      courseRealisationId: '2',
    },
    {
      userId: '2',
      courseRealisationId: '2',
    }
  ])
}

const seedCus = async () => {
  await Cu.bulkCreate([
    {
      id: '1',
      name: {
        fi: 'E-urheilun perusteet',
        en: 'Introduction to E-sports',
        sv: 'E-sportens grunder'
      },
      groupId: '1',
      courseCode: 'E-URHEILU-101',
    },
    {
      id: '2',
      name: {
        fi: 'E-urheilun syventävät opinnot',
        en: 'Advanced E-sports Studies',
        sv: 'Avancerade studier i e-sport'
      },
      groupId: '2',
      courseCode: 'E-URHEILU-102',
    },
  ])  
}

const seedCurCus = async () => {
  await CurCu.bulkCreate([
    {
      curId: '1',
      cuId: '1',
    },
    {
      curId: '1',
      cuId: '2',
    },
  ])
}