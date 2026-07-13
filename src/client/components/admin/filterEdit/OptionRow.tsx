import { Box, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material'
import { Trash2 } from 'lucide-react'

import type { FilterOption } from '../../../../common/types.ts'
import LocalizedField from './LocalizedField.tsx'

interface OptionRowProps {
  option: FilterOption
  onUpdate: (fields: Partial<FilterOption>) => void
  onUpdateName: (lang: 'fi' | 'sv' | 'en', val: string) => void
  onRemove: () => void
}

const OptionRow = ({ option, onUpdate, onUpdateName, onRemove }: OptionRowProps) => (
  <Box
    sx={{
      p: 1.5,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        label="Option ID"
        size="small"
        value={option.id}
        onChange={e => onUpdate({ id: e.target.value })}
        sx={{ flex: 1 }}
      />
      <TextField
        label="Value override"
        size="small"
        value={option.valueOverride ?? ''}
        onChange={e => onUpdate({ valueOverride: e.target.value || undefined })}
        sx={{ flex: 1 }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Selected by default
        </Typography>
        <Select
          fullWidth
          size="small"
          value={option.selectedByDefault === true ? 'true' : option.selectedByDefault === false ? 'false' : ''}
          onChange={e => {
            const v = e.target.value as string
            onUpdate({ selectedByDefault: v === 'true' ? true : v === 'false' ? false : null })
          }}
        >
          <MenuItem value="">— null —</MenuItem>
          <MenuItem value="true">true</MenuItem>
          <MenuItem value="false">false</MenuItem>
        </Select>
      </Box>
      <IconButton color="error" size="small" onClick={onRemove}>
        <Trash2 />
      </IconButton>
    </Box>
    <LocalizedField values={option.name} onChange={onUpdateName} textFieldLabel="Name" size="small" />
  </Box>
)

export default OptionRow
