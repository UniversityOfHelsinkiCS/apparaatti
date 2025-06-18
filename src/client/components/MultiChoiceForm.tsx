import React from 'react'
import { Box, Button, FormControl, TextField } from '@mui/material'
import FormQuestion from './FormQuestion.tsx'
import DateQuestion from './DateQuestion.tsx'
import StudyPhaseQuestion from './StudyPhaseQuestion.tsx'
const questions = [
  {
    id: 'study-period',
    type: 'date',
    explanation: 'sit amet, consectetur adipiscing elit.',
    question: { fi: 'Mikä on haluamasi kurssin suoritusajankohta?' },
    options: [
      { id: 'intensive_3_previous', value: 'intensive_3', name: { fi: 'kesä 25' } },
      { id: 'period_1', name: { fi: '1. periodi' } },
      { id: 'period_2', name: { fi: '2. periodi' } },
      { id: 'period_3', name: { fi: '3. periodi' } },
      { id: 'period_4', name: { fi: '4. periodi' } },
      { id: 'intensive_3', name: { fi: 'kesä 26' } },
    ],
  },
  {
    id: 'lang-1',
    type: 'multi',

    question: { fi: 'Mistä kielestä haet kursseja?' },
    options: [
      { id: '1', name: { fi: 'ei valintaa' } },
      { id: '2', name: { fi: 'Suomi' } },
      { id: '3', name: { fi: 'Ruotsi' } },
      { id: '4', name: { fi: 'Englanti' } },
    ]
  },
  {
    id: '2',
    type: 'multi',
<<<<<<< HEAD
    options: [
      { id: '1', name: { fi: 'Kyllä, vuoden sisällä' } },
      { id: '2', name: { fi: 'En ole valmistumassa vuoden sisällä' } },
    ],
    question: {fi: 'Valmistutko lähiaikoina?'},
    variants: {
      default: {
        id: '1',
        name:'default_texts',
=======

    variants: {
      default: {
        id: 1,
        name: "default_texts",
>>>>>>> 8ea2573 (variants for question)
        question: { fi: 'Valmistutko lähiaikoina?' },
        options: [
          { id: '1', name: { fi: 'Kyllä, vuoden sisällä' } },
          { id: '2', name: { fi: 'En ole valmistumassa vuoden sisällä' } },
        ],
      },
      onlyFi: {
<<<<<<< HEAD
        id: '2',
        name: 'onlyFi_texts',
=======
        id: 2,
        name: "onlyFi_texts",
>>>>>>> 8ea2573 (variants for question)
        question: { fi: 'Valmistutko lähiaikoina2?' },
        options: [
          { id: '1', name: { fi: 'Kyllä, vuoden sisällä' } },
          { id: '2', name: { fi: 'En ole valmistumassa vuoden sisällä' } },
        ],
      }
<<<<<<< HEAD
    }
=======
    },


>>>>>>> 8ea2573 (variants for question)
  },

  {
    id: '3',
    type: 'multi',
    question: { fi: 'Koetko häiritsevää jännitystä tai pelkoa kielikursseilla?' },
    options: [
      { id: '1', name: { fi: 'En niin että se häiritsisi opiskelua' } },
      { id: '2', name: { fi: 'Jännittäminen/Pelko häiritsee merkittävästi opiskeluani' } },
    ],
  },
  {
    id: '4',
    type: 'multi',
    question: { fi: 'Mikä on suosimasi opetusmuoto?' },
    options: [
      { id: '1', name: { fi: 'täysin etäopiskelu' } },
      { id: '2', name: { fi: 'etäopiskelu ja lähiopetus' } },
      { id: '3', name: { fi: 'täysin lähiopetus' } },
    ],
  },
  {
    id: '5',
    type: 'multi',
    question: { fi: 'Mikä on suosimasi opiskelun aikataulun joustavuus?' },
    options: [
      { id: '1', name: { fi: 'itsenäinen ajan käyttö' } },
      { id: '2', name: { fi: 'itsenäinen, mutta mahdollisuus ohjattuun toimintaan' } },
      { id: '3', name: { fi: 'kurssi asettaa tiukat säännöt aikataululle' } },
    ],
  },
  {
    id: '6',
    type: 'multi',
    question: { fi: 'Tarvitsetko kertausta/harjoitusta ennen kurssia?' },
    options: [
      { id: '1', name: { fi: 'Kaipaisin kertausta ennen kurssia' } },
      { id: '2', name: { fi: 'En koe tarvitsevani kertausta' } },
    ],
  },
  {
    id: '7',
    type: 'multi',
    question: { fi: 'Koen taitotasokseni' },
    options: [
      { id: '1', name: { fi: 'Välttäväksi' } },
      { id: '2', name: { fi: 'Hyväksi' } },
      { id: '3', name: { fi: 'Erinomaiseksi' } },
    ],
  },
  {
    id: '8',
    type: 'multi',
    question: { fi: 'Vanhentuneet viekie opinnot' },
    options: [
      { id: '1', name: { fi: 'ei väliä' } },
      { id: '2', name: { fi: 'ei' } },
      { id: '3', name: { fi: 'kyllä' } },
    ],
  },
  {
    id: '9',
    type: 'multi',
    question: { fi: 'Integroitu opetus' },
    options: [
      { id: '1', name: { fi: 'ei väliä' } },
      { id: '2', name: { fi: 'ei' } },
      { id: '3', name: { fi: 'kyllä' } },
    ],
  },
]

const renderFormQuestion = (key, question) => {
  switch(question.type){
  case 'date':
    //console.log('date')
    return <DateQuestion key={key} question={question} id={key} />
  case 'multi':
    //console.log("multi")
    return  <FormQuestion key={key} question={question} />
  default:
    return <p>Unknown question type</p>
  }
}

const MultiChoiceForm = ({ onSubmit, studyData }: { onSubmit: (formData: FormData) => Promise<void>, studyData: any }) => {
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
