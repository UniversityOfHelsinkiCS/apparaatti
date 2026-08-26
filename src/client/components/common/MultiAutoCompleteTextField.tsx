import type { SxProps } from '@mui/material'
import { Autocomplete, Chip, TextField } from '@mui/material'

interface MultiAutoCompleteTextFieldProps {
  id: string
  value: string[]
  onChange: (value: string[]) => void
  options: string[]
  label: string
  sx?: SxProps
  size?: 'small' | 'medium'
}

const MultiAutoCompleteTextField = ({
  id,
  value,
  onChange,
  options,
  label,
  sx,
  size,
}: MultiAutoCompleteTextFieldProps) => (
  <Autocomplete
    multiple
    freeSolo
    id={id}
    value={value}
    onChange={(_event, newValue) => onChange((newValue as string[]).map(v => v.trim()).filter(v => v.length > 0))}
    options={options}
    sx={sx}
    size={size}
    renderTags={(tagValue, getTagProps) =>
      tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option} label={option} size="small" />)
    }
    renderInput={params => <TextField {...params} label={label} />}
  />
)

export default MultiAutoCompleteTextField
