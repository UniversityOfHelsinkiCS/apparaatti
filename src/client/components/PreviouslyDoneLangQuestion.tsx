import { Box, FormControlLabel, Radio, RadioGroup, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { Question } from '../../common/types'

const PreviuslyDoneLangQuestion = ({
  question,
  languageId,
}: {
  question: Question;
  languageId: string;
}) => {
  console.log('language id is: ', languageId)
  
  const variant = question.variants[0]
  const yesOption = variant.options.find((o) => o.id === '1')
  const noOption = variant.options.find((o) => o.id === '0')

  if (!yesOption || !noOption) {
    return <p>Unknown error on question</p>
  }

  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [accordionOpen, setAccordionOpen] = useState(false)

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value)
    setAccordionOpen(event.target.value === yesOption.id) // Open accordion if "Yes" is selected
  }

  return (
    <Box>
      <Typography>{variant.question.fi}</Typography>
      <RadioGroup name={question.id} value={selectedValue} onChange={handleRadioChange}>
        <FormControlLabel
          key={yesOption.id}
          value={yesOption.id}
          control={
            <Radio
              sx={{
                '&.Mui-checked': {
                  color: '#4caf50',
                },
              }}
            />
          }
          label={yesOption.name.fi}
          sx={{
            '&:hover': {
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
            },
          }}
        />
        <FormControlLabel
          key={noOption.id}
          value={noOption.id}
          control={
            <Radio
              sx={{
                '&.Mui-checked': {
                  color: '#4caf50',
                },
              }}
            />
          }
          label={noOption.name.fi}
          sx={{
            '&:hover': {
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
            },
          }}
        />
      </RadioGroup>

      {selectedValue === yesOption.id && (
        <Accordion expanded={accordionOpen} onChange={() => setAccordionOpen(!accordionOpen)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Additional Options</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Katso ohjeet hyväksilukemiseen <a href=' https://studies.helsinki.fi/ohjeet/artikkeli/opintojen-ja-osaamisen-hyvaksilukeminen?check_logged_in=1'>täältä</a>
            </Typography>
           
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  )
}

export default PreviuslyDoneLangQuestion