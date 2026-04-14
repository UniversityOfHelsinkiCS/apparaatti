import { Box, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import type { FilterOption } from '../../../../common/types.ts'

interface Props {
  option: FilterOption
  onUpdate: (fields: Partial<FilterOption>) => void
  onUpdateName: (lang: 'fi' | 'sv' | 'en', val: string) => void
  onRemove: () => void
}

const OptionRow = ({ option, onUpdate, onUpdateName, onRemove }: Props) => (
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
        onChange={(e) => onUpdate({ id: e.target.value })}
        sx={{ flex: 1 }}
      />
      <TextField
        label="Value override"
        size="small"
        value={option.valueOverride ?? ''}
        onChange={(e) => onUpdate({ valueOverride: e.target.value || undefined })}
        sx={{ flex: 1 }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Set strict
        </Typography>
        <Select
          fullWidth
          size="small"
          value={option.setStrict === true ? 'true' : option.setStrict === false ? 'false' : ''}
          onChange={(e) => {
            const v = e.target.value as string
            onUpdate({ setStrict: v === 'true' ? true : v === 'false' ? false : null })
          }}
        >
          <MenuItem value="">— null —</MenuItem>
          <MenuItem value="true">true</MenuItem>
          <MenuItem value="false">false</MenuItem>
        </Select>
      </Box>
      <IconButton color="error" size="small" onClick={onRemove}>
        <DeleteIcon />
      </IconButton>
    </Box>
    <Box sx={{ display: 'flex', gap: 1 }}>
      {(['fi', 'sv', 'en'] as const).map((lang) => (
        <TextField
          key={lang}
          label={`Name (${lang})`}
          size="small"
          value={option.name[lang]}
          onChange={(e) => onUpdateName(lang, e.target.value)}
          sx={{ flex: 1 }}
        />
      ))}
    </Box>
  </Box>
)

export default OptionRow
