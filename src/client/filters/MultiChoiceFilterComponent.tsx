import { FormControlLabel, FormGroup } from '@mui/material'
import React from 'react'

import { Option, Question } from '../../common/types'
import HyBadge from '../components/common/hy/HyBadge.tsx'
import HyCheckbox from '../components/common/hy/HyCheckbox.tsx'
import ShrinkwrapText from '../components/common/ShrinkwrapText.tsx'
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
        const label =
          count != null ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShrinkwrapText>{option.name}</ShrinkwrapText>
              <HyBadge variant={count === 0 ? 'disabled' : 'default'}>{count}</HyBadge>
            </span>
          ) : (
            option.name
          )
        return (
          <FormControlLabel
            checked={state.includes(option.id)}
            key={option.id}
            name={filter.id}
            value={option.id}
            data-testid={`${filter.id}-option-${option.id}`}
            control={<HyCheckbox onChange={handleCheckboxChange} />}
            label={label}
            sx={{
              py: '2px',
              // overriding weird MUI default negative margin stuff
              marginLeft: '-4px',
              marginRight: '4px',
              cursor: 'default',
            }}
          />
        )
      })}
    </FormGroup>
  )
}

export default MultiChoiceFilterComponent
