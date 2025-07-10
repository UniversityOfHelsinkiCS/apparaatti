import React from 'react'
import { Box, FormControl } from '@mui/material'
import FormQuestion from './FormQuestion.tsx'
import DateQuestion from './DateQuestion.tsx'
import StudyPhaseQuestion from './StudyPhaseQuestion.tsx'
import LanguageQuestion from './LanguageQuestion.tsx'
import PeriodQuestion from './PeriodQuestion.tsx'
import PreviuslyDoneLangQuestion from './PreviouslyDoneLangQuestion.tsx'
import ActionButton from './actionButton.tsx'
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
    id: 'primary-language',
    type: 'multi',

    variants: [
      {
        name: 'default',
        question: { fi: 'Mikä on koulusivistyskielesi?' },
        options: [
          { id: '0', name: { fi: 'ei valintaa' } },
          { id: 'fi', name: { fi: 'Suomi' } },
          { id: 'sv', name: { fi: 'Ruotsi' } },
          { id: 'en', name: { fi: 'Englanti' } },
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
          { id: '0', name: { fi: 'ei valintaa' } },
          { id: 'fi', name: { fi: 'Suomi' } },
          { id: 'sv', name: { fi: 'Ruotsi' } },
          { id: 'en', name: { fi: 'Englanti' } },
        ],
      },
    ],
  },
  {
    id: 'previusly-done-lang',
    type: 'previusly-done-lang',
    variants: [
      {
        name: 'default',
        question: { fi: 'Olen suorittanut kielen tutkintoon kuuluvan kurssin jo aiemmin edellisissä opinnoissa'},
        options: [
          { id: '0', name: { fi: 'ei' } },
          { id: '1', name: { fi: 'kyllä' } },
        ],
      }
    ],
  },
  {
    id: 'graduation',
    type: 'multi',

    variants: [
      {
        name: 'default',
        options: [
          { id: '1', name: { fi: 'Kyllä, puolen vuoden sisällä' } },
          {
            id: '0',
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
            id: '0',
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
            id: '0',
            name: { fi: 'En ole valmistumassa puolen vuoden sisällä' },
          },
        ],
        question: { fi: 'Valmistutko lähiaikoina (Ruotsi kysymys)?' },
      },
    ],
  },
  {
    id: 'study-place',
    type: 'multi',
    variants: [
      {
        question: { fi: 'Mikä on suosimasi opetusmuoto?' },
        options: [
          { id: 'remote', name: { fi: 'täysin etäopiskelu' } },
          { id: 'hybrid', name: { fi: 'etäopiskelu ja lähiopetus' } },
          { id: 'onsite', name: { fi: 'täysin lähiopetus' } },
        ],
      },
    ],
  },
  {
    id: 'mentoring',
    type: 'multi',

    variants: [
      {
        name: 'default',
        question: { fi: 'Koen tarvitsevani vielä jonkin verran harjoitusta ennen tutkintooni sisältyvien CEFR B1/B2 -tason opintojen suorittamista.' },
        options: [
          {id: 'neutral', name: {fi: 'ei valintaa'}},
          { id: '1', name: { fi: 'Kaipaisin valmennusta ennen opintojen suoritusta' } },
          { id: '0', name: { fi: 'En koe tarvitsevani valmennusta' } },
        ],
      },
      {
        name: 'onlyEn',
        question: {
          fi: 'Koen tarvitsevani vielä jonkin verran harjoitusta ennen tutkintooni sisältyvien CEFR B1/B2 -tason opintojen suorittamista.' 
        },
        options: [
          {id: 'neutral', name: {fi: 'ei valintaa'}},
          { id: '1', name: { fi: 'Kaipaisin kertausta ennen kurssia' } },
          { id: '0', name: { fi: 'En koe tarvitsevani kertausta' } },
        ],
      },
    ],
  },
  {
    id: 'integrated',
    type: 'multi',
    variants: [
      {
        name: 'default',
        question: { fi: 'Olen kiinnostonut kurssista joka on integroitu oman alani opintoihin' },
        options: [
          {id: 'neutral', name: {fi: 'ei valintaa'}},
          { id: '0', name: { fi: 'ei' } },
          { id: '1', name: { fi: 'kyllä' } },
        ],
      },
    ],
  },
  {
    id: 'replacement',
    type: 'multi',
    variants: [
      {
        name: 'default',
        question: { fi: 'Koen, että olen jo aiemmissa opinnoissani / työelämässä / vapaa-ajalla hankkinut tutkintooni kuuluvia opintoja vastaavat tiedot ja taidot (CEFR B1/B2).' },
        options: [
          {id: 'neutral', name: {fi: 'ei valintaa'}},
          { id: '0', name: { fi: 'en' } },
          { id: '1', name: { fi: 'kyllä' } },
        ],
      },
    ],
  },
  {
    id: 'independent',
    type: 'multi',
    variants: [
      {
        name: 'default',
        question: { fi: 'Haluan työskennellä itsenäisesti tai autonomisesti'},
        options: [
          {id: 'neutral', name: {fi: 'ei valintaa'}},
          { id: '0', name: { fi: 'en' } },
          { id: '1', name: { fi: 'haluan' } },
        ],
      },
    ],
  },
  {
    id: 'flexible',
    type: 'multi',
    variants: [
      {
        name: 'default',
        question: { fi: 'Haluan osallistua kurssille, jonka aikataulu on joustava'},
        options: [
          {id: 'neutral', name: {fi: 'ei valintaa'}},
          { id: '0', name: { fi: 'en' } },
          { id: '1', name: { fi: 'haluan' } },
        ],
      },
    ],
  },  
]

const MultiChoiceForm = ({
  onSubmit,
  studyData,
  display
}: {
  onSubmit: (formData: FormData) => Promise<void>
  studyData: any,
  display: boolean
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
        <PeriodQuestion key={key} question={question} />
        //<FormQuestion key={key} question={question} languageId={language} /> //toimiva
      )
    case 'previusly-done-lang':
      return (
        <PreviuslyDoneLangQuestion key={key} question={question} languageId={language}></PreviuslyDoneLangQuestion>
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
          display: display === true ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'left',
          justifyContent: 'left',
          gap: 0,
          backgroundColor: 'white',
        }}
      >
        <FormControl component="fieldset">
          <StudyPhaseQuestion studyData={studyData} />
          {questions.map((q) => renderFormQuestion(q.id, q))}
        </FormControl>
        <ActionButton text="Lähetä"/>
         
      </Box>
    </form>
  )
}

export default MultiChoiceForm
