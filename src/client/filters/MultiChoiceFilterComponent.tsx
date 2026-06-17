import { FormControlLabel, FormGroup } from '@mui/material'
import React from 'react'

import { Option, Question } from '../../common/types'
import HyCheckbox from '../components/common/hy/HyCheckbox.tsx'
import { useFilterContext } from '../contexts/filterContext'

interface MultiChoiceFilterComponentProps {
  filter: Question
  state: string[]
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  options: Option[]
}

const MultiChoiceFilterComponent: React.FC<MultiChoiceFilterComponentProps> = ({
  filter,
  state,
  handleCheckboxChange,
  options,
}) => {
  const { getOptionCount } = useFilterContext()

  return (
    <FormGroup>
      {options.map(option => {
        const count = getOptionCount(filter.id, option.id)
        const label = count != null ? `${option.name} (${count})` : option.name
        return (
          <FormControlLabel
            checked={state.includes(option.id)}
            key={option.id}
            name={filter.id}
            value={option.id}
            data-cy={`${filter.id}-option-${option.id}`}
            control={<HyCheckbox onChange={handleCheckboxChange} />}
            label={label}
            sx={{ cursor: 'default' }}
          />
        )
      })}
    </FormGroup>
  )
}

export default MultiChoiceFilterComponent
