import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import React from 'react'

import { Option, Question } from '../../common/types'
import { useFilterContext } from '../contexts/filterContext'

interface DropdownFilterComponentProps {
  filter: Question
  state: string
  handleChange: (event: SelectChangeEvent<string>) => void
  options: Option[]
}

const DropdownFilterComponent: React.FC<DropdownFilterComponentProps> = ({ filter, state, handleChange, options }) => {
  const { getOptionCount } = useFilterContext()

  return (
    <FormControl sx={{ marginBottom: 2, paddingTop: 1 }}>
      <Select
        sx={{
          padding: '1px',
          minWidth: 100,
          border: '1px solid lightgray',
        }}
        name={filter.id}
        labelId={`${filter.id}-select-label`}
        id={`${filter.id}-select`}
        data-cy={`${filter.id}-select`}
        value={state}
        onChange={handleChange}
      >
        {options.map(option => {
          const count = getOptionCount(filter.id, option.id)
          const label = option.name
          return (
            <MenuItem key={option.id} value={option.id} disabled={count === 0} sx={{ opacity: count === 0 ? 0.4 : 1 }}>
              {count != null ? `${label} (${count})` : label}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

export default DropdownFilterComponent
