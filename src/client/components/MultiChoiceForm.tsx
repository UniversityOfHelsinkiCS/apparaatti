import React, { useEffect, useRef, useState } from 'react'
import { Box, FormControl } from '@mui/material'
import FormQuestion from './FormQuestion.tsx'
import DateQuestion from './DateQuestion.tsx'
import StudyPhaseQuestion from './StudyPhaseQuestion.tsx'
import LanguageQuestion from './LanguageQuestion.tsx'
import PeriodQuestion from './PeriodQuestion.tsx'
import PreviuslyDoneLangQuestion from './PreviouslyDoneLangQuestion.tsx'
import ActionButton from './actionButton.tsx'
import { User } from '../../common/types.ts'
import PrimaryLanguageSpecificationQuestion from './PrimaryLanguageSpecification.tsx'
const questions = [
  {
    id: 'primary-language',
    type: 'primary-language',

    variants: [
      {
        name: 'default',
        question: { fi: 'Mikä on koulusivistyskielesi?', sv: 'Vilket är ditt undervisningsspråk?', en: 'What is your language of instruction?' },
        options: [
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
        question: { fi: 'Mistä kielestä haet kursseja?', sv: 'Vilket språk letar du efter kurser i?', en: 'What language are you looking for?' },

        options: [
          { id: 'fi', name: { fi: 'Suomi' } },
          { id: 'sv', name: { fi: 'Ruotsi' } },
          { id: 'en', name: { fi: 'Englanti' } },
        ],
      },
    ],
  },
  {
    id: 'primary-language-specification',
    type: 'primary-language-specification',

    variants: [
      {
        name: 'default',
        question: { fi: 'Kumman ensisijaisen kielen tyypin haluat valita?', sv: 'Vilken primär språktyp skulle du vilja välja?', en: 'Which primary language type do you want to choose?' },
        options: [
          { id: 'writtenAndSpoken', name: { fi: 'Molemmat' } },
          { id: 'written', name: { fi: 'Kirjoitusviestintä' } },
          { id: 'spoken', name: { fi: 'Puheviestintä' } },
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
        question: { fi: 'Olen suorittanut kielen tutkintoon kuuluvan kurssin jo aiemmin edellisissä opinnoissa.', sv: 'Jag har redan avslutat en språkkurs som en del av min examen i tidigare studier.', en: 'I have already completed a language course as part of my degree in previous studies'},
        options: [
          { id: '0', name: { fi: 'Ei' } },
          { id: '1', name: { fi: 'Kyllä' } },
        ],
      }
    ],
  },
  {
    id: 'study-period',
    type: 'period-date',
    explanation: 'Mistä periodista haluat kursseja?',
    variants: [
      {
        name: 'default',
        question: { fi: 'Mikä on haluamasi kurssin suoritusajankohta?', sv: 'Vilket datum är din önskade kurs?', en: 'What is the date of your desired course?' },
        options: [
          {
            id: 'intensive_3_previous',
            value: 'intensive_3',
            name: { fi: 'Kesä 25' },
          },
          { id: 'period_1', name: { fi: '1. periodi' } },
          { id: 'period_2', name: { fi: '2. periodi' } },
          { id: 'period_3', name: { fi: '3. periodi' } },
          { id: 'period_4', name: { fi: '4. periodi' } },
          { id: 'intensive_3', name: { fi: 'Kesä 26' } },
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
        question: {
          fi: 'Koen, että olen jo aiemmissa opinnoissani / työelämässä / vapaa-ajalla hankkinut tutkintooni kuuluvia opintoja vastaavat tiedot ja taidot (CEFR B1/B2).',
          sv: 'Jag anser att jag redan har förvärvat kunskaper och färdigheter motsvarande de som ingår i min examen i mina tidigare studier / arbetsliv / fritid. (CEFR B1/B2)',
          en: 'I feel that I have already acquired knowledge and skills equivalent to those included in my degree in my previous studies / working life / leisure time. (CEFR B1/B2)'
        },
        options: [
          {id: 'neutral', name: {fi: 'Ei valintaa'}},
          { id: '0', name: { fi: 'En' } },
          { id: '1', name: { fi: 'Kyllä' } },
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
        question: {
          fi: 'Koen tarvitsevani vielä jonkin verran harjoitusta ennen tutkintooni sisältyvien CEFR B1/B2 -tason opintojen suorittamista.',
          sv: 'Jag känner att jag fortfarande behöver lite övning innan jag slutför CEFR B1/B2-nivåstudierna som ingår i min examen.',
          en: 'I feel that I need more studying before completing the CEFR B1/B2 level studies included in my degree.'

         },
        options: [
          {id: 'neutral', name: {fi: 'Ei valintaa'}},
          { id: '1', name: { fi: 'Kaipaisin valmennusta ennen opintojen suoritusta' } },
          { id: '0', name: { fi: 'En koe tarvitsevani valmennusta' } },
        ],
      },
      {
        name: 'onlyEn',
        question: {
          fi: 'Koen tarvitsevani vielä jonkin verran harjoitusta ennen tutkintooni sisältyvien CEFR B1/B2 -tason opintojen suorittamista.',
          sv: 'Jag känner att jag fortfarande behöver lite övning innan jag slutför CEFR B1/B2-nivåstudierna som ingår i min examen.',
          en: 'I feel that I need more studying before completing the CEFR B1/B2 level studies included in my degree.'
        },
        options: [
          {id: 'neutral', name: {fi: 'Ei valintaa'}},
          { id: '1', name: { fi: 'Kaipaisin kertausta ennen kurssia' } },
          { id: '0', name: { fi: 'En koe tarvitsevani kertausta' } },
        ],
      },
    ],
  },
  {
    id: 'challenge',
    type: 'multi',
    variants: [
      {
        name: 'default',
        question: {
          fi: 'Minulle kielenoppiminen on erityisen haasteellista ja se jännittää/pelottaa minua paljon',
          sv: 'För mig är det särskilt utmanande att lära sig ett språk och det gör mig väldigt nervös/rädd.',
          en: 'For me, learning a language is particularly challenging and it makes me very nervous/scared.'
        },
        options: [
          { id: 'neutral', name: {fi: 'Ei valintaa'}},
          { id: '0', name: { fi: 'Ei' } },
          { id: '1', name: { fi: 'Kyllä' } },
        ],
      },
    ],
  },  
  {
    id: 'graduation',
    type: 'multi',

    variants: [
      {
        name: 'default',
        question: { fi: 'Valmistutko lähiaikoina?', sv: 'Tar du examen snart?', en: 'Are you graduating soon?' },
        options: [
          { id: '1', name: { fi: 'Kyllä, puolen vuoden sisällä' } },
          {
            id: '0',
            name: { fi: 'En ole valmistumassa puolen vuoden sisällä' },
          },
        ],
      },
   ],
  },
  {
    id: 'study-place',
    type: 'multi',
    variants: [
      {
        question: { fi: 'Mikä on suosimasi opetusmuoto?', sv: 'Vilken är din föredragna undervisningsmetod?', en: 'What is your preferred teaching method?' },
        options: [
          { id: 'remote', name: { fi: 'Täysin etäopiskelu' } },
          { id: 'hybrid', name: { fi: 'Etäopiskelu ja lähiopetus' } },
          { id: 'onsite', name: { fi: 'Täysin lähiopetus' } },
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
        question: { fi: 'Olen kiinnostonut kurssista, joka on integroitu oman alani opintoihin.', sv: 'Jag är intresserad av en kurs som är integrerad i mina studier inom mitt område.', en: 'I am interedted in a course that is integrated into the studies in my field.' },
        options: [
          {id: 'neutral', name: {fi: 'Ei valintaa'}},
          { id: '0', name: { fi: 'Ei' } },
          { id: '1', name: { fi: 'Kyllä' } },
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
        question: { fi: 'Haluan työskennellä itsenäisesti tai autonomisesti.', sv: 'Jag vill arbeta självständigt eller autonomt.', en: 'I want to work independently or autonomously.'},
        options: [
          {id: 'neutral', name: {fi: 'Ei valintaa'}},
          { id: '0', name: { fi: 'En' } },
          { id: '1', name: { fi: 'Haluan' } },
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
        question: { fi: 'Haluan osallistua kurssille, jonka aikataulu on joustava.', sv: 'Jag vill ta en kurs med ett flexibelt schema.', en: 'I want to take a course with a flexible schedule'  },
        options: [
          {id: 'neutral', name: {fi: 'Ei valintaa'}},
          { id: '0', name: { fi: 'En' } },
          { id: '1', name: { fi: 'Haluan' } },
        ],
      },
    ],
  },  
]

const MultiChoiceForm = ({
  onSubmit,
  studyData,
  display,
  user,
  supportedOrganisations
}: {
  onSubmit: (formData: FormData) => Promise<void>
  studyData: any,
  display: boolean,
  user: User,
  supportedOrganisations: any
}) => {
  const [primaryLanguage, setPrimaryLanguage] = useState('')
  const [language, setLanguage] = useState('')

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

    case 'primary-language':
      return (
        <LanguageQuestion
          key={key}
          question={question}
          setLanguage={setPrimaryLanguage}
        />
      )
    case 'primary-language-specification':
      return (
        <PrimaryLanguageSpecificationQuestion
          key={key}
          question={question}
          language={language}
          primaryLanguage={primaryLanguage}
        />
      )
    case 'language':
      return (
        <LanguageQuestion
          key={key}
          question={question}
          setLanguage={setLanguage}
        />
      )
    case 'period-date':
      return (
        <PeriodQuestion key={key} question={question} />
      )
    case 'previusly-done-lang':
      return (
        <PreviuslyDoneLangQuestion key={key} question={question} languageId={language}></PreviuslyDoneLangQuestion>
      )
    default:
      return <p>Unknown question type</p>
    }
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
          <StudyPhaseQuestion supportedOrganisations={supportedOrganisations} user={user} studyData={studyData} />
          {questions.map((q) => renderFormQuestion(q.id, q))}
        </FormControl>
        <ActionButton text="Lähetä"/>
         
      </Box>
    </form>
  )
}

export default MultiChoiceForm
