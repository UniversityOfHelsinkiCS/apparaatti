import { Box, Checkbox, Divider, ListItemText, Menu, MenuItem, Stack } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

interface TagColumnPickerProps {
  tags: CourseTag[]
  visibleKeys: string[]
  onChange: (keys: string[]) => void
}

const TagColumnPicker = ({ tags, visibleKeys, onChange }: TagColumnPickerProps) => {
  const { t } = useTranslation()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  const keysWithPrefix = (prefix: string) => tags.filter(tag => tag.key.startsWith(prefix)).map(tag => tag.key)

  const toggle = (key: string) =>
    onChange(visibleKeys.includes(key) ? visibleKeys.filter(visible => visible !== key) : [...visibleKeys, key])

  return (
    <Box>
      <BlackOutlinedButton type="button" onClick={event => setAnchor(event.currentTarget)}>
        {t('v2:courseTags.columns', { shown: visibleKeys.length, total: tags.length })}
      </BlackOutlinedButton>

      <Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)}>
        <Stack direction="row" spacing={1} sx={{ px: 2, py: 1 }}>
          <BlackOutlinedButton type="button" onClick={() => onChange(tags.map(tag => tag.key))}>
            {t('v2:courseTags.columnsAll')}
          </BlackOutlinedButton>
          <BlackOutlinedButton type="button" onClick={() => onChange(keysWithPrefix('kks-'))}>
            {t('v2:courseTags.columnsStudy')}
          </BlackOutlinedButton>
          <BlackOutlinedButton type="button" onClick={() => onChange(keysWithPrefix('kkt-'))}>
            {t('v2:courseTags.columnsFaculty')}
          </BlackOutlinedButton>
        </Stack>

        <Divider />

        {tags.map(tag => (
          <MenuItem key={tag.key} onClick={() => toggle(tag.key)} dense>
            <Checkbox
              checked={visibleKeys.includes(tag.key)}
              size="small"
              sx={{ color: '#374151', p: 0.5, mr: 1, '&.Mui-checked': { color: '#111827' } }}
            />
            <ListItemText primary={tag.key} secondary={tag.description} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default TagColumnPicker
