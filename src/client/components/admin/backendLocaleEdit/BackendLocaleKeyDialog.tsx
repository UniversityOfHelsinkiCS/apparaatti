import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { BackendLocaleKey } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'

type BackendLocaleKeyDialogProps = {
  localeKey: BackendLocaleKey | 'new'
  onClose: () => void
  onSaved: () => void
}

const BackendLocaleKeyDialog = ({ localeKey, onClose, onSaved }: BackendLocaleKeyDialogProps) => {
  const { t } = useTranslation()
  const isNew = localeKey === 'new'
  const [key, setKey] = useState(isNew ? '' : localeKey.key)
  const [description, setDescription] = useState(isNew ? '' : localeKey.description)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const response = isNew
      ? await adminFetch('POST', '/api/admin/backend-locales', { key, description })
      : await adminFetch('PUT', `/api/admin/backend-locales/${encodeURIComponent(localeKey.key)}`, { description })
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
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isNew ? t('v2:admin.backendLocales.newKey') : t('v2:admin.backendLocales.editKey')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            fullWidth
            size="small"
            label={t('v2:admin.backendLocales.keyLabel')}
            helperText={t('v2:admin.backendLocales.keyHelp')}
            value={key}
            disabled={!isNew}
            onChange={e => setKey(e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label={t('v2:admin.backendLocales.descriptionLabel')}
            helperText={t('v2:admin.backendLocales.descriptionHelp')}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose} disabled={saving}>
          {t('v2:admin.backendLocales.cancel')}
        </BlackOutlinedButton>
        <Button variant="contained" color="secondary" onClick={handleSave} disabled={saving || !key || !description}>
          {t('v2:admin.backendLocales.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BackendLocaleKeyDialog
