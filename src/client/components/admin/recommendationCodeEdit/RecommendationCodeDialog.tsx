import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { organisationCodeToName } from '../../../../common/organisations.ts'
import type { RecommendationCode, RecommendationLanguage } from '../../../../common/types.ts'
import { translateLocalizedString } from '../../../util/i18n.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'

type CodeDraft = {
  organisationCode: string
  languageId: string
  courseCode: string
}

const emptyDraft = (languages: RecommendationLanguage[]): CodeDraft => ({
  organisationCode: Object.keys(organisationCodeToName)[0],
  languageId: languages.length > 0 ? String(languages[0].id) : '',
  courseCode: '',
})

const toDraft = (code: RecommendationCode): CodeDraft => ({
  organisationCode: code.organisationCode,
  languageId: String(code.languageId),
  courseCode: code.courseCode,
})

type RecommendationCodeDialogProps = {
  code: RecommendationCode | 'new'
  languages: RecommendationLanguage[]
  onClose: () => void
  onSaved: () => void
}

const RecommendationCodeDialog = ({ code, languages, onClose, onSaved }: RecommendationCodeDialogProps) => {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<CodeDraft>(code === 'new' ? emptyDraft(languages) : toDraft(code))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const organisationSelectId = useId()
  const languageSelectId = useId()

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const isNew = code === 'new'
    const path = isNew ? '/api/admin/recommendation-codes' : `/api/admin/recommendation-codes/${code.id}`
    const payload = {
      organisationCode: draft.organisationCode,
      languageId: Number(draft.languageId),
      courseCode: draft.courseCode.trim(),
    }

    const response = await adminFetch(isNew ? 'POST' : 'PUT', path, payload)
    setSaving(false)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      setError(errorData?.message ?? t('v2:admin.recommendationCodes.saveFailed'))
      return
    }

    onSaved()
    onClose()
  }

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {code === 'new' ? t('v2:admin.recommendationCodes.newCode') : t('v2:admin.recommendationCodes.editCode')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <FormControl fullWidth size="small">
            <InputLabel shrink id={organisationSelectId}>
              {t('v2:admin.recommendationCodes.organisation')}
            </InputLabel>
            <Select
              labelId={organisationSelectId}
              label={t('v2:admin.recommendationCodes.organisation')}
              value={draft.organisationCode}
              onChange={e => setDraft(current => ({ ...current, organisationCode: e.target.value }))}
            >
              {Object.keys(organisationCodeToName).map(organisationCode => (
                <MenuItem key={organisationCode} value={organisationCode}>
                  {organisationCode} — {organisationCodeToName[organisationCode]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel shrink id={languageSelectId}>
              {t('v2:admin.recommendationCodes.language')}
            </InputLabel>
            <Select
              labelId={languageSelectId}
              label={t('v2:admin.recommendationCodes.language')}
              value={draft.languageId}
              onChange={e => setDraft(current => ({ ...current, languageId: e.target.value }))}
            >
              {languages.map(language => (
                <MenuItem key={language.id} value={String(language.id)}>
                  {translateLocalizedString(language.name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label={t('v2:admin.recommendationCodes.courseCode')}
            value={draft.courseCode}
            helperText={t('v2:admin.recommendationCodes.courseCodeHelp')}
            onChange={e => setDraft(current => ({ ...current, courseCode: e.target.value }))}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose} disabled={saving}>
          {t('v2:admin.recommendationCodes.cancel')}
        </BlackOutlinedButton>
        <Button variant="contained" color="secondary" onClick={handleSave} disabled={saving}>
          {t('v2:admin.recommendationCodes.save')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RecommendationCodeDialog
