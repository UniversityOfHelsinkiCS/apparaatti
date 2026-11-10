import {
  Alert,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { Language, LocalizedText } from '../../../common/types'
import BlackOutlinedButton from '../common/BlackOutlinedButton'

const LANGUAGES: Language[] = ['fi', 'sv', 'en']

type WordingTextFormProps = {
  /** Variant fields: what "Muokattava variantti:" shows, e.g. "Yleinen oletusteksti". */
  targetLabel?: string
  /** Variant fields: goes back to the variant step. */
  onChangeTarget?: () => void
  /** Filter-wide fields: explains that the text is shared by every variant. */
  note?: string
  text: LocalizedText
  onChangeText: (language: Language, value: string) => void
  /** Warns that the edit changes the catch-all text every variant falls back to. */
  showDefaultWarning: boolean
  isSaving: boolean
  saveFailed: boolean
  onCancel: () => void
  onSave: () => void
}

/** Step 2 of the wording editor: one text field per language plus cancel/save. */
const WordingTextForm = ({
  targetLabel,
  onChangeTarget,
  note,
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
    <>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {targetLabel !== undefined && (
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography variant="body2" data-testid="wording-edit-target">
                {t('v2:filterWordings.target.current', { variant: targetLabel })}
              </Typography>
              {onChangeTarget && (
                <BlackOutlinedButton type="button" size="small" onClick={onChangeTarget} disabled={isSaving}>
                  {t('v2:filterWordings.target.change')}
                </BlackOutlinedButton>
              )}
            </Stack>
          )}
          {note && (
            <Typography variant="body2" data-testid="wording-edit-note">
              {note}
            </Typography>
          )}

          {showDefaultWarning && <Alert severity="warning">{t('v2:filterWordings.popover.defaultWarning')}</Alert>}

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
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onCancel} disabled={isSaving}>
          {t('v2:filterWordings.popover.cancel')}
        </BlackOutlinedButton>
        <Button
          variant="contained"
          color="secondary"
          onClick={onSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={16} /> : null}
        >
          {t('v2:filterWordings.popover.save')}
        </Button>
      </DialogActions>
    </>
  )
}

export default WordingTextForm
