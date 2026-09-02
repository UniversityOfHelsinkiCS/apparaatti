import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BackendLocaleKey, BackendLocaleValue, Language } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'
import { emptyValueDraft, toPayload, toValueDraft, type ValueDraft } from './backendLocaleUtils.ts'
import ConditionSelectors from './ConditionSelectors.tsx'
import TextEditorWithPreview from './TextEditorWithPreview.tsx'

type BackendLocaleValueDialogProps = {
  localeKey: BackendLocaleKey
  value: BackendLocaleValue | 'new'
  onClose: () => void
  onSaved: () => void
}

const BackendLocaleValueDialog = ({ localeKey, value, onClose, onSaved }: BackendLocaleValueDialogProps) => {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<ValueDraft>(value === 'new' ? emptyValueDraft() : toValueDraft(value))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patchDraft = (patch: Partial<ValueDraft>) => setDraft(current => ({ ...current, ...patch }))

  const patchText = (language: Language, text: string) =>
    setDraft(current => ({ ...current, text: { ...current.text, [language]: text } }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const isNew = value === 'new'
    const path = isNew
      ? `/api/admin/backend-locales/${encodeURIComponent(localeKey.key)}/values`
      : `/api/admin/backend-locales/values/${value.id}`

    const response = await adminFetch(isNew ? 'POST' : 'PUT', path, toPayload(draft))
    setSaving(false)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      setError(errorData?.message ?? t('v2:admin.backendLocales.saveFailed'))
      return
    }

    onSaved()
    onClose()
  }

  return (
    <Dialog open onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {value === 'new' ? t('v2:admin.backendLocales.newText') : t('v2:admin.backendLocales.editText')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Alert severity="info" icon={false}>
            <Typography variant="subtitle2">{localeKey.key}</Typography>
            <Typography variant="body2">{localeKey.description}</Typography>
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}

          <Typography variant="subtitle2">{t('v2:admin.backendLocales.whenShown')}</Typography>
          <ConditionSelectors draft={draft} onChange={patchDraft} />

          <Typography variant="subtitle2">{t('v2:admin.backendLocales.textToShow')}</Typography>
          <TextEditorWithPreview text={draft.text} onChange={patchText} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose} disabled={saving}>
          {t('v2:admin.backendLocales.cancel')}
        </BlackOutlinedButton>
        <Button variant="contained" color="secondary" onClick={handleSave} disabled={saving}>
          {t('v2:admin.backendLocales.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BackendLocaleValueDialog
