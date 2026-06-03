import { FormControlLabel, FormGroup } from '@mui/material'
import AppCheckbox from '../components/common/AppCheckbox.tsx'
import { Question, Option } from '../../common/types'
import React from 'react'

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
  return (
    <FormGroup>
      {options.map((option) => (
        <FormControlLabel
          checked={state.includes(option.id)}
          key={option.id}
          name={filter.id}
          value={option.id}
          data-cy={`${filter.id}-option-${option.id}`}
          sx={{
            '&:hover': {
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
            },
          }}
          control={
            <AppCheckbox
              onChange={handleCheckboxChange}
            />
          }
          label={option.name}
        />
      ))}
    </FormGroup>
  )
}

export default MultiChoiceFilterComponent
