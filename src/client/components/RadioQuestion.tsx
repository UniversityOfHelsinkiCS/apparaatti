import { Box, RadioGroup } from '@mui/material'
import { useState } from 'react'

import { ANY_VARIANT_QUERY } from '../../common/conditionMatching.ts'
import { Question } from '../../common/types.ts'
import { pickVariant } from '../hooks/useQuestions.tsx'
import SingleChoiceOption from './common/SingleChoiceOption.tsx'
import ExtraInfoModal from './ExtraInfoModal.tsx'
import QuestionTitle, { questionGroupName, questionTextId } from './QuestionTitle.tsx'

const RadioQuestion = ({
  question,
  value,
  setValue,
  scope,
}: {
  question: Question
  value: string
  setValue: (value: string) => void
  scope?: string
}) => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const variant = pickVariant(question, ANY_VARIANT_QUERY)

  if (!variant || variant?.skipped) {
    return null
  }
  return (
    <Box>
      <QuestionTitle
        handleOpen={handleOpen}
        title={variant.question}
        titleLanguage={variant.questionLanguage}
        question={question}
        scope={scope}
      />

      <ExtraInfoModal question={question} open={open} handleClose={handleClose} />

      <RadioGroup
        name={questionGroupName(question.id, scope)}
        value={value}
        onChange={e => setValue(e.target.value)}
        aria-labelledby={questionTextId(question.id, scope)}
        sx={{ marginTop: 1 }}
      >
        {variant.options?.map(option => (
          <SingleChoiceOption key={option.id} option={option} filterId={question.id} />
        ))}
      </RadioGroup>
    </Box>
  )
}

export default RadioQuestion
