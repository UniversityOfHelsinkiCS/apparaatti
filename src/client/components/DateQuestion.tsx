import React from 'react'
import { Box, TextField, FormControl } from '@mui/material'

const DateQuestion = ({ question, id }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 2 }}>
      <FormControl component="fieldset">
        <p>{question.fi}</p>
        <p>Alku</p>
        <TextField
          label=""
          type="date"
          name={`${id}-start`}
          slotProps={{ input: { placeholder: 'Alkaa' } }}
          variant="outlined"
        />
        Loppu
        <TextField
          label=""
          type="date"
          name={`${id}-end`}
          slotProps={{ input: { placeholder: 'Loppuu' } }}
          variant="outlined"
        />
      </FormControl>
    </Box>
  )
}

export default DateQuestion
