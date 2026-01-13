import {
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material'
import { Question } from '../../../common/types.ts'
import SuperToggle from '../components/SuperToggle'

const PrimaryLanguageSpecificationFilter = ({
  filter,
  language,
  primaryLanguage,
  setPrimaryLanguageSpecification,
}: {
  filter: Question
  language: string
  primaryLanguage: string
  setPrimaryLanguageSpecification: (spec: string) => void
}) => {
  const checkShouldShow = () => {
    if (language === '' || language === 'en') {
      return false
    }
    return language === primaryLanguage
  }

  const shouldShow: boolean = checkShouldShow()
  const variant = filter.variants[0]

  const handleChange = (e: any) => {
    setPrimaryLanguageSpecification(e.target.value)
  }

  if (!shouldShow) {
    return null
  }

  return (
    <>
      <SuperToggle filterId={filter.id} />
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
    </>
  )
}

export default PrimaryLanguageSpecificationFilter
