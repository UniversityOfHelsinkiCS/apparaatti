import Cur from "../models/cur"
import Enrolment from "../models/enrolment"
import User from "../models/user"

export const seed = async () => {
  await Enrolment.destroy({
    where: {},
  })
  await User.destroy({
    where: {},
  })
  await Cur.destroy({
    where: {},
  })

  await seedUsers()
  await seedCurs()
  await seedEnrolments()

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
        fi: 'E-urheilun perusteet', 
        en: 'Introduction to E-sports',
        sv: 'E-sportens grunder'
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-01'),
    },
    {
      id: '2',
      name: { 
        fi: 'E-urheilun syventävät opinnot', 
        en: 'Advanced E-sports Studies',
        sv: 'Avancerade studier i e-sport'
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