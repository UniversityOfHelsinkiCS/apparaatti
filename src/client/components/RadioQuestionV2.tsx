import { Box, FormControlLabel, RadioGroup } from '@mui/material'
import HyRadio from './common/hy/HyRadio'
import { Question } from '../../common/types.ts'
import { pickVariant } from '../hooks/useQuestions.tsx'
import QuestionTitleV2 from './QuestionTitleV2.tsx'
import { useState } from 'react'
import ExtraInfoModalV2 from './ExtraInfoModalV2.tsx'

const RadioQuestionV2 = ({
  question,
  value,
  setValue,
}: {
  question: Question
  value: string
  setValue: (value: string) => void
}) => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const variant = pickVariant(question, 'default')

  if (!variant || variant?.skipped) {
    return null
  }
  return (
    <Box
      sx={{
        paddingTop: 1,
      }}
    >
      <QuestionTitleV2 handleOpen={handleOpen} title={variant.question} question={question} />

      <ExtraInfoModalV2 question={question} open={open} handleClose={handleClose} />

      <RadioGroup name={question.id} value={value} onChange={e => setValue(e.target.value)} sx={{ marginTop: 1 }}>
        {variant.options?.map(option => (
          <FormControlLabel
            key={option.id}
            value={option.id}
            data-cy={`${question.id}-option-${option.id}`}
            control={<HyRadio />}
            label={option.name}
          />
        ))}
      </RadioGroup>
    </Box>
  )
}

export default RadioQuestionV2
