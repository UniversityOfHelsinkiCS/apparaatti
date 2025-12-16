import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import { Question, Option } from '../../../common/types'
import React from 'react'

interface SingleChoiceFilterComponentProps {
  filter: Question
  state: string
  handleRadioChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  options: Option[]
}

const SingleChoiceFilterComponent: React.FC<SingleChoiceFilterComponentProps> = ({
  filter,
  state,
  handleRadioChange,
  options,
}) => {
  return (
    <RadioGroup name={filter.id} value={state} onChange={handleRadioChange}>
      {options.map((option) => (
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

export default SingleChoiceFilterComponent
