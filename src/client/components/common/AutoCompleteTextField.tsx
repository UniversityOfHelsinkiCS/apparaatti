import type { SxProps } from '@mui/material'
import { Autocomplete, TextField } from '@mui/material'

interface AutoCompleteTextFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: string[]
  label: string
  sx?: SxProps
  size?: 'small' | 'medium'
}

const AutoCompleteTextField = ({ id, value, onChange, options, label, sx, size }: AutoCompleteTextFieldProps) => (
  <Autocomplete
    id={id}
    value={value}
    onChange={(_event, newValue: string | null) => onChange(newValue ?? '')}
    inputValue={value}
    onInputChange={(_event, newInputValue) => onChange(newInputValue)}
    options={options}
    sx={sx}
    size={size}
    renderInput={params => <TextField {...params} label={label} />}
  />
)

export default AutoCompleteTextField
