import Cu from "../db/models/cu.ts"
import Cur from "../db/models/cur.ts"
import CurCu from "../db/models/curCu.ts"
import Enrolment from "../db/models/enrolment.ts"
import User from "../db/models/user.ts"
import Form from "../db/models/form.ts"

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
  await Form.destroy({
    where: {},
  })

  await seedUsers()
  await seedCurs()
  await seedCus()
  await seedEnrolments()
  await seedCurCus()
  await seedForms()

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

const seedForms = async () => {
  await seedForm()
}

const seedForm = async () => {
  await Form.create({
    id: "1",
    name: "Kyselylomake",
    courseRealisationId: "1",
    active: true,
    questions: [
      {
        id: "1",
        question: {
          fi: "Kuinka paljon jännität?",
          sv: "Hur mycket oroar du dig?",
          en: "How much do you worry?",
        },
        type: "select",
        options: [
          { id: "1", name: { fi: "En ollenkaan", sv: "", en: "" } },
          { id: "2", name: { fi: "Jonkin verran", sv: "", en: "" } },
          { id: "3", name: { fi: "Paljon", sv: "", en: "" } },
        ],
      },
      {
        id: "2",
        question: {
          fi: "Mikä on suosimasi opetuksen muoto?",
          sv: "Vad är din favoritfärg?",
          en: "What is your favorite color?",
        },
        type: "select",
        options: [
          { id: "1", name: { fi: "Täysin etäopetus", sv: "", en: "" } },
          { id: "2", name: { fi: "Puolet etänä puolet läsnä", sv: "", en: "" } },
          { id: "3", name: { fi: "Vain lähiopetus", sv: "", en: "" } },
        ],
      },
      {
        id: "3",
        question: {
          fi: "Kuinka paljon kokemusta sinulla on?",
          sv: "",
          en: "",
        },
        type: "select",
        options: [
          { id: "1", name: { fi: "Ei ollenkaan", sv: "", en: "" } },
          { id: "2", name: { fi: "Perusteet", sv: "", en: "" } },
          { id: "3", name: { fi: "Edistynyt", sv: "", en: "" } },
        ],
      }
    ],
  })
}