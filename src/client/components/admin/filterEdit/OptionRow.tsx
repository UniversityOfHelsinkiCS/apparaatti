import { Box, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { FilterOption } from '../../../../common/types.ts'
import LocalizedField from './LocalizedField.tsx'

interface OptionRowProps {
  option: FilterOption
  onUpdate: (fields: Partial<FilterOption>) => void
  onUpdateName: (lang: 'fi' | 'sv' | 'en', val: string) => void
  onRemove: () => void
}

const OptionRow = ({ option, onUpdate, onUpdateName, onRemove }: OptionRowProps) => {
  const { t } = useTranslation()

  return (
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
          label={t('v2:admin.filterEdit.optionId')}
          size="small"
          value={option.id}
          onChange={e => onUpdate({ id: e.target.value })}
          sx={{ flex: 1 }}
        />
        <TextField
          label={t('v2:admin.filterEdit.valueOverride')}
          size="small"
          value={option.valueOverride ?? ''}
          onChange={e => onUpdate({ valueOverride: e.target.value || undefined })}
          sx={{ flex: 1 }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {t('v2:admin.filterEdit.selectedByDefault')}
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
            <MenuItem value="">{t('v2:admin.filterEdit.nullValue')}</MenuItem>
            <MenuItem value="true">true</MenuItem>
            <MenuItem value="false">false</MenuItem>
          </Select>
        </Box>
        <IconButton color="error" size="small" onClick={onRemove}>
          <Trash2 />
        </IconButton>
      </Box>
      <LocalizedField
        values={option.name}
        onChange={onUpdateName}
        textFieldLabel={t('v2:admin.filterEdit.optionName')}
        size="small"
      />
    </Box>
  )
}

export default OptionRow
