import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Question } from '../../common/types.tsx'
import React from 'react'
import QuestionTitle from './questionTitle.tsx'
import ExtraInfoModal from './ExtraInfoModal.tsx'
const FormQuestion = ({
  question,
  languageId,
}: {
  question: Question
  languageId: string
}) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const pickVariant = () => {
    if (languageId === '2') {
      if (question.variants[1]) {
        const v = question.variants.find((v) => v.name == 'onlyFi')
        if (v) {
          return v
        } else {
          return question.variants[0]
        }
      } else {
        return question.variants[0]
      }
    } else if (languageId === '3') {
      if (question.variants[1]) {
        const v = question.variants.find((v) => v.name == 'onlySe')
        if (v) {
          return v
        } else {
          return question.variants[0]
        }
      } else {
        return question.variants[0]
      }
    } else if (languageId === '4') {
      if (question.variants[1]) {
        const v = question.variants.find((v) => v.name == 'onlyEn')
        if (v) {
          return v
        } else {
          return question.variants[0]
        }
      } else {
        return question.variants[0]
      }
    } else {
      return question.variants[0]
    }
  }

  const variant = pickVariant()
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

export default FormQuestion
