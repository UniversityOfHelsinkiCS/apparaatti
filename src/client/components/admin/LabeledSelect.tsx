import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useId } from 'react'

export type LabeledSelectOption = {
  value: string
  label: string
}

type LabeledSelectProps = {
  label: string
  value: string
  options: LabeledSelectOption[]
  onChange: (value: string) => void
  emptyLabel?: string
  disabled?: boolean
}

const LabeledSelect = ({ label, value, options, onChange, emptyLabel, disabled }: LabeledSelectProps) => {
  const selectId = useId()

  const renderSelectedValue = (selected: string) => {
    if (selected === '') return emptyLabel ?? ''
    return options.find(option => option.value === selected)?.label ?? selected
  }

  return (
    <FormControl fullWidth size="small" disabled={disabled}>
      <InputLabel shrink id={selectId}>
        {label}
      </InputLabel>
      <Select
        labelId={selectId}
        label={label}
        value={value}
        displayEmpty={emptyLabel !== undefined}
        renderValue={emptyLabel === undefined ? undefined : renderSelectedValue}
        onChange={e => onChange(e.target.value)}
      >
        {emptyLabel !== undefined && <MenuItem value="">{emptyLabel}</MenuItem>}
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default LabeledSelect
