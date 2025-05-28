import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import Enrolment from '../db/models/enrolment.ts'
import User from '../db/models/user.ts'
import Form from '../db/models/form.ts'

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
    id: '1',
    name: 'Kyselylomake',
    courseRealisationId: '1',
    active: true,
    questions: [
      {
        id: '1',
        question: {
          fi: 'Mikä on haluamasi kurssin suoritusajankohta',
          sv: '',
          en: '',
        },
        type: 'select',
        options: [
          { id: '1', name: { fi: '1. periodi', sv: '', en: '' } },
          { id: '2', name: { fi: '2. periodi', sv: '', en: '' } },
          { id: '3', name: { fi: '3. periodi', sv: '', en: '' } },
          { id: '4', name: { fi: '4. periodi', sv: '', en: '' } },
          { id: '5', name: { fi: '5. periodi', sv: '', en: '' } },
        ],
      },
      {
        id: '2',
        question: {
          fi: 'Valmistutko lähiaikoina?',
          sv: '',
          en: '',
        },
        type: 'select',
        options: [
          { id: '1', name: { fi: 'Kyllä suunnitelen valmistuvani vuoden sisällä', sv: '', en: '' } },
          { id: '2', name: { fi: 'En ole valmistumassa vuoden sisällä', sv: '', en: '' } },
        ],
      },
      {
        id: '3',
        question: {
          fi: 'Koetko häiritsevää jännitystä tai pelkoa kielikursseilla?',
          sv: '',
          en: '',
        },
        type: 'select',
        options: [
          { id: '1', name: { fi: 'En niin että se häiritsisi opiskelua', sv: '', en: '' } },
          { id: '2', name: { fi: 'Jännittäminen/Pelko häiritsee merkittävästi opiskeluani ', sv: '', en: '' } },
        ],
      },
      {
        id: '4',
        question: {
          fi: 'Mikä on suosimasi opetusmuoto',
          sv: '',
          en: '',
        },
        type: 'select',
        options: [
          { id: '1', name: { fi: 'täysin etäopiskelu', sv: '', en: '' } },
          { id: '2', name: { fi: 'etäopiskelu ja lähiopetus', sv: '', en: '' } },
          { id: '3', name: { fi: 'täysin lähiopetus', sv: '', en: '' } },
        ],
      },
      {
        id: '5',
        question: {
          fi: 'Mikä on suosimasi opiskelun aikataulun joustavuus?',
          sv: '',
          en: '',
        },
        type: 'select',
        options: [
          { id: '1', name: { fi: 'itsenäinen ajan käyttö', sv: '', en: '' } },
          { id: '2', name: { fi: 'itsenäinen, mutta kurssilla mahdollisuus osallistua ohjattuun toimintaan', sv: '', en: '' } },
          { id: '3', name: { fi: 'kurssi asettaa tiukat säännöt aikataululle', sv: '', en: '' } },
        ],
      },
      {
        id: '6',
        question: {
          fi: 'Tarvitsetko kertausta/harjoitusta ennen kurssia',
          sv: '',
          en: '',
        },
        type: 'select',
        options: [
          { id: '1', name: { fi: 'Kaipaisin kertausta ennen kurssia', sv: '', en: '' } },
          { id: '2', name: { fi: 'En koe tarvitsevani kertausta', sv: '', en: '' } },
        ],
      },
      {
        id: '7',
        question: {
          fi: 'Koen taitotasokseni',
          sv: '',
          en: '',
        },
        type: 'select',
        options: [
          { id: '1', name: { fi: 'Välttäväksi', sv: '', en: '' } },
          { id: '2', name: { fi: 'Hyväksi', sv: '', en: '' } },
          { id: '3', name: { fi: 'Erinomaiseksi', sv: '', en: '' } },
        ],
      },
      {
        id: '8',
        question: {
          fi: 'Vanhentuneet viekie opinnot',
          sv: '',
          en: '',
        },
        type: 'select',
        options: [
          { id: '1', name: { fi: 'ei väliä', sv: '', en: '' } },
          { id: '2', name: { fi: 'ei', sv: '', en: '' } },
          { id: '3', name: { fi: 'kyllä', sv: '', en: '' } },
        ],
      },
      {
        id: '9',
        question: {
          fi: 'Integroitu opetus',
          sv: '',
          en: '',
        },
        type: 'select',
        options: [
          { id: '1', name: { fi: 'ei väliä', sv: '', en: '' } },
          { id: '2', name: { fi: 'ei', sv: '', en: '' } },
          { id: '3', name: { fi: 'kyllä', sv: '', en: '' } },
        ],
      }

    
    ],
  })
}