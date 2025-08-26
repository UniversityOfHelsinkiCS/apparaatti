import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Question } from '../../common/types.ts'
import React from 'react'
import QuestionTitle from './questionTitle.tsx'
import ExtraInfoModal from './ExtraInfoModal.tsx'
const LanguageQuestion = ({
  question,
  setLanguage,
}: {
  question: Question
  setLanguage: (id: string) => void
}) => {
  const [open, setOpen] = React.useState(false)
  const [_choice, setChoice] = React.useState('')
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const variant = question.variants[0]

  const handleChoice = (id: string) => {
    setChoice(id)
    setLanguage(id)
  }
  return (
    <Box
      sx={{
        paddingTop: 4,
      }}
    >
      <QuestionTitle number={question.number} handleOpen={handleOpen} title={variant.question}/>
      <ExtraInfoModal question={question} open={open} handleClose = {handleClose}/>

      <RadioGroup name={question.id}>
        {variant.options.map((option) => (
          <FormControlLabel
            onClick={() => handleChoice(option.id)}
            key={option.id}
            value={option.id}
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

export default LanguageQuestion
