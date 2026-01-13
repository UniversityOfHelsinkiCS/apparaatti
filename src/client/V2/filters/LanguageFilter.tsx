import {
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Question } from '../../../common/types.ts'
import { pickVariant } from '../../hooks/useQuestions.tsx'

const LanguageFilter = ({
  filter,
  setLanguage,
}: {
  filter: Question
  setLanguage: (id: string) => void
}) => {
  const variant = pickVariant(filter, 'default')

  const handleChoice = (id: string) => {
    setLanguage(id)
  }

  if (!variant || variant?.skipped) {
    return null
  }

  return (
    <RadioGroup name={filter.id}>
      {variant.options.map((option) => (
        <FormControlLabel
          onClick={() => handleChoice(option.id)}
          key={option.id}
          value={option.id}
          data-cy={`${filter.id}-option-${option.id}`}
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
  )
}

export default LanguageFilter
