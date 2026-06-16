import { useState } from 'react'
import { Question } from '../../common/types.ts'
import { pickVariant } from '../hooks/useQuestions.tsx'
import QuestionTitleV2 from './QuestionTitleV2.tsx'
import ExtraInfoModalV2 from './ExtraInfoModalV2.tsx'
import RadioButtonGroup from './common/RadioButtonGroup.tsx'

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
    <div style={{ paddingTop: '8px' }}>
      <QuestionTitleV2 handleOpen={handleOpen} title={variant.question} question={question} />

      <ExtraInfoModalV2 question={question} open={open} handleClose={handleClose} />

      <RadioButtonGroup
        name={question.id}
        value={value}
        options={variant.options?.map(o => ({ id: o.id, label: o.name })) ?? []}
        onChange={setValue}
        style={{ marginTop: '8px' }}
      />
    </div>
  )
}

export default RadioQuestionV2
