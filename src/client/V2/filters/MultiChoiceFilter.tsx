import {
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Question } from '../../../common/types.tsx'
import { pickVariant } from '../../hooks/useQuestions.tsx'

const MultiChoiceFilter = ({
  filter,
  variantId,
}: {
  filter: Question
  variantId: string
}) => {
  const variant = pickVariant(filter, variantId)
  if (!variant || variant?.skipped) {
    return null
  }

  return (
    <RadioGroup name={filter.id}>
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
