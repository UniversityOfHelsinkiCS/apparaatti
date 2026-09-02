import { Box, MenuItem, Select, TextField, Typography } from '@mui/material'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { Language, LocalizedText } from '../../../../common/types.ts'
import AppMarkdown from '../../common/AppMarkdown.tsx'

type TextEditorWithPreviewProps = {
  text: LocalizedText
  onChange: (language: Language, value: string) => void
}

const LANG_OPTIONS: Array<{ value: Language; labelKey: string }> = [
  { value: 'fi', labelKey: 'v2:admin.filterEdit.langFi' },
  { value: 'sv', labelKey: 'v2:admin.filterEdit.langSv' },
  { value: 'en', labelKey: 'v2:admin.filterEdit.langEn' },
]

const TextEditorWithPreview = ({ text, onChange }: TextEditorWithPreviewProps) => {
  const { t } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('fi')
  const selectId = useId()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Box sx={{ width: { xs: '100%', sm: 220 } }}>
        <Typography variant="caption" color="text.secondary">
          {t('v2:admin.filterEdit.language')}
        </Typography>
        <Select
          fullWidth
          size="small"
          id={selectId}
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value as Language)}
        >
          {LANG_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {t(option.labelKey)}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <TextField
          fullWidth
          multiline
          minRows={8}
          label={t('v2:admin.backendLocales.textLabel')}
          value={text[selectedLanguage] ?? ''}
          onChange={e => onChange(selectedLanguage, e.target.value)}
        />
        <Box
          sx={{
            flex: 1,
            minHeight: 200,
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflowX: 'auto',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t('v2:admin.backendLocales.preview')}
          </Typography>
          <AppMarkdown>{text[selectedLanguage] ?? ''}</AppMarkdown>
        </Box>
      </Box>
    </Box>
  )
}

export default TextEditorWithPreview
