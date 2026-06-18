import type { SxProps } from '@mui/material'
import { Autocomplete, TextField } from '@mui/material'

interface AutoCompleteTextFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  options: string[]
  label: string
  sx?: SxProps
}

const AutoCompleteTextField = ({ id, value, onChange, options, label, sx }: AutoCompleteTextFieldProps) => (
  <Autocomplete
    id={id}
    value={value}
    onChange={(_event, newValue: string | null) => onChange(newValue ?? '')}
    inputValue={value}
    onInputChange={(_event, newInputValue) => onChange(newInputValue)}
    options={options}
    sx={sx}
    renderInput={params => <TextField {...params} label={label} />}
  />
)

export default AutoCompleteTextField
