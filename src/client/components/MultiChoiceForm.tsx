import React from 'react'
import { Box, Button, FormControl, TextField } from '@mui/material'
import FormQuestion from './FormQuestion.tsx'
import DateQuestion from './DateQuestion.tsx'
const questions = [
  {
    id: 'study-year',
    type: 'multi',
    question: { fi: 'Mikä on haluamasi vuosi?' },
    options: [
      { id: '2024', name: { fi: '2024-2025' } },
      { id: '2025', name: { fi: '2025-2026' } },
      { id: '2026', name: { fi: '2026-2027' } },
    ],
  },
  {
    id: 'study-period',
    type: 'multi',
    question: { fi: 'Mikä on haluamasi kurssin suoritusajankohta?' },
    options: [
      { id: 'period_1', name: { fi: '1. periodi' } },
      { id: 'period_2', name: { fi: '2. periodi' } },
      { id: 'period_3', name: { fi: '3. periodi' } },
      { id: 'period_4', name: { fi: '4. periodi' } },
      { id: 'intensive_3', name: { fi: 'kesä' } },
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
    ],
  },
  {
    id: '2',
    type: 'multi',
    question: { fi: 'Valmistutko lähiaikoina?' },
    options: [
      { id: '1', name: { fi: 'Kyllä, vuoden sisällä' } },
      { id: '2', name: { fi: 'En ole valmistumassa vuoden sisällä' } },
    ],
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
    return <DateQuestion key={key} question={question.question} id={key} />
  case 'multi':
    return  <FormQuestion key={key} question={question} />
  default:
    return <p>unkown quesion type</p>
  }

}

const MultiChoiceForm = ({ onSubmit }: { onSubmit: (formData: FormData) => Promise<void> }) => {
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
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          gap: 0,
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <FormControl component="fieldset">
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
