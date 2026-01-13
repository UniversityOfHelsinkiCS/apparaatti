import { FormControl, MenuItem, Select } from '@mui/material'
import { Question, Option } from '../../../common/types'
import React from 'react'
import { translateLocalizedString } from '../../util/i18n'
import SuperToggle from '../components/SuperToggle'

interface DropdownFilterComponentProps {
  filter: Question
  state: string
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  options: Option[]
}

const DropdownFilterComponent: React.FC<DropdownFilterComponentProps> = ({
  filter,
  state,
  handleChange,
  options,
}) => {
  return (
    <FormControl sx={{ minWidth: 200, marginBottom: 2, paddingTop: 1 }}>
      <SuperToggle filterId={filter.id} />
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
        {options.map((option) => (
          <MenuItem key={option.id} value={option.id}>
            {translateLocalizedString(option.name)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default DropdownFilterComponent
