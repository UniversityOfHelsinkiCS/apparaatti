import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import React from 'react'

import { Option, Question } from '../../common/types'
import { useOptionCountText } from '../components/common/OptionCountBadge'
import VisuallyHidden from '../components/common/VisuallyHidden'
import { useFilterContext } from '../contexts/filterContext'

interface DropdownFilterComponentProps {
  filter: Question
  state: string
  handleChange: (event: SelectChangeEvent<string>) => void
  options: Option[]
}

const DropdownFilterComponent: React.FC<DropdownFilterComponentProps> = ({ filter, state, handleChange, options }) => {
  const { getOptionCount } = useFilterContext()
  const optionCountText = useOptionCountText()

  // aria-disabled options stay focusable, so reject the selection here instead
  const onChange = (event: SelectChangeEvent<string>) => {
    if (getOptionCount(filter.id, event.target.value) === 0) {
      return
    }
    handleChange(event)
  }

  return (
    <FormControl sx={{ marginBottom: 2, paddingTop: 1 }}>
      <Select
        sx={{
          padding: '1px',
          minWidth: 100,
          border: '1px solid lightgray',
        }}
        name={filter.id}
        labelId={`question-text-${filter.id}`}
        id={`${filter.id}-select`}
        data-testid={`${filter.id}-select`}
        value={state}
        onChange={onChange}
      >
        {options.map(option => {
          const count = getOptionCount(filter.id, option.id)
          const label = option.name
          return (
            <MenuItem
              key={option.id}
              value={option.id}
              aria-disabled={count === 0}
              sx={{ opacity: count === 0 ? 0.4 : 1 }}
            >
              {count != null ? (
                <>
                  {label}
                  <span aria-hidden>&nbsp;({count})</span>
                  <VisuallyHidden component="span">{optionCountText(count)}</VisuallyHidden>
                </>
              ) : (
                label
              )}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

export default DropdownFilterComponent
