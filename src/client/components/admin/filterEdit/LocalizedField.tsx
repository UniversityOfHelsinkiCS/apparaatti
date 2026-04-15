import { useId, useState } from 'react'
import { Box, MenuItem, Select, TextField, Typography } from '@mui/material'

type Lang = 'fi' | 'sv' | 'en'

interface LocalizedFieldProps {
  values: { fi?: string; sv?: string; en?: string }
  onChange: (lang: Lang, value: string) => void
  textFieldLabel: string
  multiline?: boolean
  minRows?: number
  size?: 'small' | 'medium'
}

const LANG_OPTIONS: Array<{ value: Lang; label: string }> = [
  { value: 'fi', label: 'Finnish' },
  { value: 'sv', label: 'Swedish' },
  { value: 'en', label: 'English' },
]

const LocalizedField = ({
  values,
  onChange,
  textFieldLabel,
  multiline = false,
  minRows,
  size = 'medium',
}: LocalizedFieldProps) => {
  const [selectedLang, setSelectedLang] = useState<Lang>('fi')
  const selectId = useId()
  const inputMinHeight = multiline ? 120 : size === 'small' ? 44 : 52

  return (
    <Box sx={{ display: 'flex', gap: 1.25, flexDirection: 'column' }}>
      <Box sx={{ width: { xs: '100%', sm: 220 } }}>
        <Typography variant="caption" color="text.secondary">
          Language
        </Typography>
        <Select
          fullWidth
          size={size}
          id={selectId}
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value as Lang)}
        >
          {LANG_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <TextField
        fullWidth
        size={size}
        label={textFieldLabel}
        multiline={multiline}
        minRows={multiline ? minRows ?? 2 : undefined}
        value={values[selectedLang] ?? ''}
        onChange={(e) => onChange(selectedLang, e.target.value)}
        sx={{
          '& .MuiInputBase-root': {
            minHeight: inputMinHeight,
            alignItems: multiline ? 'flex-start' : 'center',
          },
          '& .MuiInputBase-inputMultiline': {
            minHeight: inputMinHeight - 32,
          },
        }}
      />
    </Box>
  )
}

export default LocalizedField
