import React from 'react'
import { Box, Button, FormControl } from '@mui/material'
import FormQuestion from './FormQuestion.tsx'
import DateQuestion from './DateQuestion.tsx'
import StudyPhaseQuestion from './StudyPhaseQuestion.tsx'
import LanguageQuestion from './LanguageQuestion.tsx'
import PeriodQuestion from './PeriodQuestion.tsx'
const questions = [
  {
    id: 'study-period',
    type: 'period-date',
    explanation: 'Mistä periodista haluat kursseja?',
    variants: [
      {
        name: 'default',
        question: { fi: 'Mikä on haluamasi kurssin suoritusajankohta?' },
        options: [
          {
            id: 'intensive_3_previous',
            value: 'intensive_3',
            name: { fi: 'kesä 25' },
          },
          { id: 'period_1', name: { fi: '1. periodi' } },
          { id: 'period_2', name: { fi: '2. periodi' } },
          { id: 'period_3', name: { fi: '3. periodi' } },
          { id: 'period_4', name: { fi: '4. periodi' } },
          { id: 'intensive_3', name: { fi: 'kesä 26' } },
        ],
      },
    ],
  },
  {
    id: 'lang-1',
    type: 'language',

    variants: [
      {
        name: 'default',
        question: { fi: 'Mistä kielestä haet kursseja?' },
        options: [
          { id: '1', name: { fi: 'ei valintaa' } },
          { id: '2', name: { fi: 'Suomi' } },
          { id: '3', name: { fi: 'Ruotsi' } },
          { id: '4', name: { fi: 'Englanti' } },
        ],
      },
    ],
  },
  {
    id: '2',
    type: 'multi',

    variants: [
      {
        name: 'default',
        options: [
          { id: '1', name: { fi: 'Kyllä, puolen vuoden sisällä' } },
          {
            id: '2',
            name: { fi: 'En ole valmistumassa puolen vuoden sisällä' },
          },
        ],
        question: { fi: 'Valmistutko lähiaikoina?' },
      },
      {
        name: 'onlyFi',
        options: [
          { id: '1', name: { fi: 'Kyllä, puolen vuoden sisällä' } },
          {
            id: '2',
            name: { fi: 'En ole valmistumassa puolen vuoden sisällä' },
          },
        ],
        question: { fi: 'Valmistutko lähiaikoina (Suomi kysymys)?' },
      },

      {
        name: 'onlySe',
        options: [
          { id: '1', name: { fi: 'Kyllä, puolen vuoden sisällä' } },
          {
            id: '2',
            name: { fi: 'En ole valmistumassa puolen vuoden sisällä' },
          },
        ],
        question: { fi: 'Valmistutko lähiaikoina (Ruotsi kysymys)?' },
      },
    ],
  },

  /*{
    id: '3',
    type: 'multi',

    variants: [
      {
        name: 'default',
        options: [
          { id: '1', name: { fi: 'Vastaus1' } },
          { id: '2', name: { fi: 'Vastaus2' } },
        ],
        question: { fi: 'Mikä on suosimasi opetusmuoto?' },
      },
    ],
  },*/
  {
    id: '4',
    type: 'multi',
    variants: [
      {
        question: { fi: 'Mikä on suosimasi opetusmuoto?' },
        options: [
          { id: '1', name: { fi: 'täysin etäopiskelu' } },
          { id: '2', name: { fi: 'etäopiskelu ja lähiopetus' } },
          { id: '3', name: { fi: 'täysin lähiopetus' } },
        ],
      },
    ],
  },

  {
    id: '5',
    type: 'multi',
    variants: [
      {
        name: 'default',
        question: { fi: 'Mikä on suosimasi opiskelun aikataulun joustavuus?' },
        options: [
          { id: '1', name: { fi: 'itsenäinen ajan käyttö' } },
          {
            id: '2',
            name: { fi: 'itsenäinen, mutta mahdollisuus ohjattuun toimintaan' },
          },
          {
            id: '3',
            name: { fi: 'kurssi asettaa tiukat säännöt aikataululle' },
          },
        ],
      },
    ],
  },

  {
    id: '6',
    type: 'multi',

    variants: [
      {
        name: 'default',
        question: { fi: 'Tarvitsetko kertausta/harjoitusta ennen kurssia?' },
        options: [
          { id: '1', name: { fi: 'Kaipaisin kertausta ennen kurssia' } },
          { id: '2', name: { fi: 'En koe tarvitsevani kertausta' } },
        ],
      },
      {
        name: 'onlyEn',
        question: {
          fi: 'Tarvitsetko kertausta/harjoitusta ennen kurssia (Vain englanti)?',
        },
        options: [
          { id: '1', name: { fi: 'Kaipaisin kertausta ennen kurssia' } },
          { id: '2', name: { fi: 'En koe tarvitsevani kertausta' } },
        ],
      },
    ],
  },

  {
    id: '7',
    type: 'multi',
    variants: [
      {
        question: { fi: 'Koen taitotasokseni' },
        options: [
          { id: '1', name: { fi: 'Välttäväksi' } },
          { id: '2', name: { fi: 'Hyväksi' } },
          { id: '3', name: { fi: 'Erinomaiseksi' } },
        ],
      },
    ],
  },

  {
    id: '8',
    type: 'multi',
    variants: [
      {
        question: { fi: 'Vanhentuneet viekie opinnot' },
        options: [
          { id: '1', name: { fi: 'ei väliä' } },
          { id: '2', name: { fi: 'ei' } },
          { id: '3', name: { fi: 'kyllä' } },
        ],
      },
    ],
  },
  {
    id: '9',
    type: 'multi',
    variants: [
      {
        question: { fi: 'Integroitu opetus' },
        options: [
          { id: '1', name: { fi: 'ei väliä' } },
          { id: '2', name: { fi: 'ei' } },
          { id: '3', name: { fi: 'kyllä' } },
        ],
      },
    ],
  },
]

const MultiChoiceForm = ({
  onSubmit,
  studyData,
}: {
  onSubmit: (formData: FormData) => Promise<void>
  studyData: any
}) => {
  const [language, setLanguage] = React.useState('')

  const renderFormQuestion = (key, question) => {
    switch (question.type) {
    case 'date':
      //console.log('date')
      return <DateQuestion key={key} question={question} />
    case 'multi':
      //console.log("multi")
      return (
        <FormQuestion key={key} question={question} languageId={language} />
      )
    case 'language':
      return (
        <LanguageQuestion
          key={key}
          question={question}
          getLanguageId={getLanguageId}
        />
      )
    case 'period-date':
      return (
        //<PeriodQuestion key={key} question={question} />
        <FormQuestion key={key} question={question} languageId={language} /> //toimiva
      )
    default:
      return <p>Unknown question type</p>
    }
  }

  const getLanguageId = (id: string) => {
    setLanguage(id)
  }
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault()
    const formData = new FormData(ev.currentTarget)
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'left',
          justifyContent: 'left',
          padding: 2,
          gap: 0,
          maxWidth: '30vw',
          marginLeft: '20vw',
          backgroundColor: 'white',
        }}
      >
        <FormControl component="fieldset">
          <StudyPhaseQuestion studyData={studyData} />
          {questions.map((q) => renderFormQuestion(q.id, q))}
        </FormControl>
        <Button
          variant="outlined"
          type="submit"
          sx={{
            borderColor: '#90caf9',
            color: 'black',
            '&:hover': {
              backgroundColor: '#2196f3',
              color: 'white',
            },
            marginTop: 4,
          }}
        >
          Submit
        </Button>
      </Box>
    </form>
  )
}

export default MultiChoiceForm
