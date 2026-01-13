import { Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import { green } from '@mui/material/colors'
import { Question, Option } from '../../../common/types'
import React from 'react'
import SuperToggle from '../components/SuperToggle'

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
      <SuperToggle filterId={filter.id} />
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
            <Checkbox
              onChange={handleCheckboxChange}
              color="default"
              sx={{ '&.Mui-checked': { color: green[500] } }}
            />
          }
          label={option.name}
        />
      ))}
    </FormGroup>
  )
}

export default MultiChoiceFilterComponent
