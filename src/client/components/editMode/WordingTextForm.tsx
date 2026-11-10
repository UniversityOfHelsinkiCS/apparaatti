import { Alert, Box, CircularProgress, Stack, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { Language, LocalizedText } from '../../../common/types'
import BlackContainedButton from '../common/BlackContainedButton'
import BlackOutlinedButton from '../common/BlackOutlinedButton'

const LANGUAGES: Language[] = ['fi', 'sv', 'en']

type WordingTextFormProps = {
  text: LocalizedText
  onChangeText: (language: Language, value: string) => void
  /** Warns that the edit changes the catch-all text every variant falls back to. */
  showDefaultWarning: boolean
  isSaving: boolean
  saveFailed: boolean
  onCancel: () => void
  onSave: () => void
}

/** One text field per language plus cancel/save. */
const WordingTextForm = ({
  text,
  onChangeText,
  showDefaultWarning,
  isSaving,
  saveFailed,
  onCancel,
  onSave,
}: WordingTextFormProps) => {
  const { t } = useTranslation()

  return (
    <Box>
      {showDefaultWarning && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          {t('v2:filterWordings.popover.defaultWarning')}
        </Alert>
      )}
      <Stack spacing={1.5}>
        {LANGUAGES.map(language => (
          <TextField
            key={language}
            size="small"
            multiline
            minRows={2}
            label={t(`v2:filterWordings.popover.language.${language}`)}
            value={text[language] ?? ''}
            onChange={event => onChangeText(language, event.target.value)}
          />
        ))}
        {saveFailed && <Alert severity="error">{t('v2:filterWordings.popover.saveFailed')}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <BlackOutlinedButton type="button" onClick={onCancel} disabled={isSaving}>
            {t('v2:filterWordings.popover.cancel')}
          </BlackOutlinedButton>
          <BlackContainedButton
            type="button"
            onClick={onSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} /> : null}
          >
            {t('v2:filterWordings.popover.save')}
          </BlackContainedButton>
        </Stack>
      </Stack>
    </Box>
  )
}

export default WordingTextForm
