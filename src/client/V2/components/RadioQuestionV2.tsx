import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Question } from '../../../common/types.ts'
import { pickVariant } from '../../hooks/useQuestions.tsx'
import QuestionTitleV2 from './QuestionTitleV2.tsx'
import { useState } from 'react'
import ExtraInfoModalV2 from './ExtraInfoModalV2.tsx'

const RadioQuestionV2 = ({
  question,
  value,
  setValue,
}: {
  question: Question,
  value: string,
  setValue: (value: string) => void,
}) => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const variant = pickVariant(question, 'default')

  if(!variant || variant?.skipped){
    return null
  }
  return (
    <Box
      sx={{
        paddingTop: 1,
      }}
    >
      <QuestionTitleV2 number={question.number} handleOpen={handleOpen} title={variant.question} question={question}/>
      <ExtraInfoModalV2 question={question} open={open} handleClose={handleClose}/>

      <RadioGroup name={question.id} value={value} onChange={(e) => setValue(e.target.value)}>
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

export default RadioQuestionV2
