import {
  FormControlLabel,
  FormGroup,
  Checkbox,
} from '@mui/material'
import { useFilterContext } from '../filterContext.tsx'
import { useTranslation } from 'react-i18next'
import FilterAccordion from '../FilterAccordion.tsx'

const PeriodFilter = () => {
  const { selectedPeriods, setSelectedPeriods } = useFilterContext()
  const { t } = useTranslation()
  const summerText = t('form:summer')
  const periodText = t('form:period')

  const periodOptions = [
    { id: 'intensive_3_previous', name: summerText + ' 2025' },
    { id: 'period_1', name: '1. ' + periodText },
    { id: 'period_2', name: '2. ' + periodText },
    { id: 'period_3', name: '3. ' + periodText },
    { id: 'period_4', name: '4. ' + periodText },
    { id: 'intensive_3', name: summerText + ' 2026' },
  ]

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target
    if (checked) {
      setSelectedPeriods([...selectedPeriods, value])
    } else {
      setSelectedPeriods(selectedPeriods.filter((period) => period !== value))
    }
  }

  return (
    <FilterAccordion title={t('v2:periodFilter:title')}>
      <FormGroup>
        {periodOptions.map((option) => (
          <FormControlLabel
            key={option.id}
            control={
              <Checkbox
                value={option.id}
                checked={selectedPeriods.includes(option.id)}
                onChange={handleChange}
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
      </FormGroup>
    </FilterAccordion>
  )
}

export default PeriodFilter
