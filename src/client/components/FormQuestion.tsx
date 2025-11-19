import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Question } from '../../common/types.tsx'
import QuestionTitle from './questionTitle.tsx'
import ExtraInfoModal from './ExtraInfoModal.tsx'
import { pickVariant } from '../hooks/useQuestions.tsx'
import { useState } from 'react'
const FormQuestion = ({
  question,
  questionVariantId,
}: {
  question: Question
  questionVariantId: string
}) => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const variant = pickVariant(question, questionVariantId)
  if(!variant || variant?.skipped){
    return(
      <></>
    )
  }
  return (
    <Box
      sx={{
        paddingTop: 4,
      }}
    >
      <QuestionTitle handleOpen={handleOpen} number={question.number} title={variant.question} question={question}/>
      <ExtraInfoModal currentVariant={questionVariantId} question={question} open={open} handleClose={handleClose}/>
      <RadioGroup name={question.id}>
        {variant.options.map((option) => (
          <FormControlLabel
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

export default FormQuestion
