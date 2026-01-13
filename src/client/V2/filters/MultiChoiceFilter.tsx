import {
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Question } from '../../../common/types.tsx'
import { pickVariant } from '../../hooks/useQuestions.tsx'
import { useFilterContext } from '../filterContext.tsx'

const MultiChoiceFilter = ({
  filter,
  variantId,
}: {
  filter: Question
  variantId: string
}) => {
  const {
    setReplacement,
    setMentoring,
    setFinmu,
    setChallenge,
    setGraduation,
    setIntegrated,
    setIndependent,
  } = useFilterContext()

  const variant = pickVariant(filter, variantId)
  if (!variant || variant?.skipped) {
    return null
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    switch (filter.id) {
    case 'replacement':
      setReplacement(value)
      break
    case 'mentoring':
      setMentoring(value)
      break
    case 'finmu':
      setFinmu(value)
      break
    case 'challenge':
      setChallenge(value)
      break
    case 'graduation':
      setGraduation(value)
      break
    case 'integrated':
      setIntegrated(value)
      break
    case 'independent':
      setIndependent(value)
      break
    default:
      break
    }
  }

  return (
    <RadioGroup name={filter.id} onChange={handleChange}>
      {variant.options.map((option) => (
        <FormControlLabel
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

export default MultiChoiceFilter
