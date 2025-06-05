import React from 'react'
import { Box, Button, FormControl } from '@mui/material'
import FormQuestion from './FormQuestion.tsx'
const questions = [
  {
    id: '1',
    question: { fi: 'Mikä on haluamasi kurssin suoritusajankohta?' },
    options: [
      { id: '1', name: { fi: '1. periodi' } },
      { id: '2', name: { fi: '2. periodi' } },
      { id: '3', name: { fi: '3. periodi' } },
      { id: '4', name: { fi: '4. periodi' } },
      { id: '5', name: { fi: '5. periodi' } },
    ],
  },
  {
    id: 'lang-1',
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
    question: { fi: 'Valmistutko lähiaikoina?' },
    options: [
      { id: '1', name: { fi: 'Kyllä, vuoden sisällä' } },
      { id: '2', name: { fi: 'En ole valmistumassa vuoden sisällä' } },
    ],
  },
  {
    id: '3',
    question: { fi: 'Koetko häiritsevää jännitystä tai pelkoa kielikursseilla?' },
    options: [
      { id: '1', name: { fi: 'En niin että se häiritsisi opiskelua' } },
      { id: '2', name: { fi: 'Jännittäminen/Pelko häiritsee merkittävästi opiskeluani' } },
    ],
  },
  {
    id: '4',
    question: { fi: 'Mikä on suosimasi opetusmuoto?' },
    options: [
      { id: '1', name: { fi: 'täysin etäopiskelu' } },
      { id: '2', name: { fi: 'etäopiskelu ja lähiopetus' } },
      { id: '3', name: { fi: 'täysin lähiopetus' } },
    ],
  },
  {
    id: '5',
    question: { fi: 'Mikä on suosimasi opiskelun aikataulun joustavuus?' },
    options: [
      { id: '1', name: { fi: 'itsenäinen ajan käyttö' } },
      { id: '2', name: { fi: 'itsenäinen, mutta mahdollisuus ohjattuun toimintaan' } },
      { id: '3', name: { fi: 'kurssi asettaa tiukat säännöt aikataululle' } },
    ],
  },
  {
    id: '6',
    question: { fi: 'Tarvitsetko kertausta/harjoitusta ennen kurssia?' },
    options: [
      { id: '1', name: { fi: 'Kaipaisin kertausta ennen kurssia' } },
      { id: '2', name: { fi: 'En koe tarvitsevani kertausta' } },
    ],
  },
  {
    id: '7',
    question: { fi: 'Koen taitotasokseni' },
    options: [
      { id: '1', name: { fi: 'Välttäväksi' } },
      { id: '2', name: { fi: 'Hyväksi' } },
      { id: '3', name: { fi: 'Erinomaiseksi' } },
    ],
  },
  {
    id: '8',
    question: { fi: 'Vanhentuneet viekie opinnot' },
    options: [
      { id: '1', name: { fi: 'ei väliä' } },
      { id: '2', name: { fi: 'ei' } },
      { id: '3', name: { fi: 'kyllä' } },
    ],
  },
  {
    id: '9',
    question: { fi: 'Integroitu opetus' },
    options: [
      { id: '1', name: { fi: 'ei väliä' } },
      { id: '2', name: { fi: 'ei' } },
      { id: '3', name: { fi: 'kyllä' } },
    ],
  },
]

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
          {questions.map((q) => (
            <FormQuestion key={q.id} question={q} />
          ))}
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
