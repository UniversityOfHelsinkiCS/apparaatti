import React from 'react'
import { Box, TextField, FormControl, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { Question } from '../../common/types'

const DateQuestion = ({ question, id }: {question: Question, id: string}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 2 }}>
      <FormControl component="fieldset">
        <p>{question.fi}</p>
        <p>Alku</p>

        <Accordion>
          <AccordionSummary id="panel-header" aria-controls="panel-content">
            Lisätietoa
          </AccordionSummary>
          <AccordionDetails>
            {question.explanation ? question.explanation : 'Ei lisätietoa'}
          </AccordionDetails>
        </Accordion>



        <TextField
          label=""
          type="date"
          name={`date-start-${id}`}
          slotProps={{ input: { placeholder: 'Alkaa' } }}
          variant="outlined"
        />
       
      </FormControl>
    </Box>
  )
}

export default DateQuestion
