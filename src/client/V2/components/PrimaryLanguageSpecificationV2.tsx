import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Question } from '../../../common/types.ts'
import QuestionTitleV2 from './QuestionTitleV2.tsx'
import { useState } from 'react'
import { useFilterContext } from '../filterContext.tsx'
import ExtraInfoModalV2 from './ExtraInfoModalV2.tsx'
import { pickVariant } from '../../hooks/useQuestions.tsx'

const PrimaryLanguageSpecificationV2 = ({
  question,
}: {
  question: Question
}) => {
  const {
    language,
    primaryLanguage,
    primaryLanguageSpecification,
    setPrimaryLanguageSpecification,
  } = useFilterContext()

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const checkShouldShow = () => {
    //english is not split into spoken or written yet so return false
    if (language === '' || language === 'en') {
      return false
    }
    return language === primaryLanguage
  }

  const shouldShow: boolean = checkShouldShow()
  
  const variant = pickVariant(question, 'default')

  const handleChange = (e: any) => {
    setPrimaryLanguageSpecification(e.target.value)
  }

  if (!shouldShow || !variant || variant.skipped) {
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

      <RadioGroup
        name={question.id}
        onChange={handleChange}
        value={primaryLanguageSpecification}
      >
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

export default PrimaryLanguageSpecificationV2
