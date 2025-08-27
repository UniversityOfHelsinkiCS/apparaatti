import React from 'react'
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'

import { Question } from '../../common/types'
import QuestionTitle from './questionTitle'
import ExtraInfoModal from './ExtraInfoModal'

const DateQuestion = ({ question }: { question: Question }) => {
  const [open, setOpen] = React.useState(false)
  const [_choice, setChoice] = React.useState('')
  //const [ year, setYear ] = React.useState('')
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const variant = question.variants[0]

  const handleChoice = (id: string) => {
    setChoice(id)
  }

  return (
    <Box
      sx={{
        paddingTop: 4,
      }}
    >
      <QuestionTitle handleOpen={handleOpen} number={question.number} title={variant.question}/>
      <ExtraInfoModal question={question} open={open} handleClose={handleClose}/>
      <RadioGroup name={question.id}>
        {variant.options.map((option) => (
          <FormControlLabel
            onClick={() => handleChoice(option.id)}
            key={option.id}
            value={option.id}
            data-cy={`${question.id}-option-${option.id}`}
            control={
              <Radio
                sx={{
                  '&.Mui-checked': {
                    color: '#4caf50',
                  },
                }}
              />
            }
            label={option.name}
            sx={{
              '&:hover': {
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
              },
            }}
          />
        ))}
      </RadioGroup>
    </Box>
  )
}

export default DateQuestion
