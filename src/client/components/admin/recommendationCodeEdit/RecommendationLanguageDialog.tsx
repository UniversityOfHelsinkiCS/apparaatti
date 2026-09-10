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
  Typography,
} from '@mui/material'
import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { RecommendationLanguage } from '../../../../common/types.ts'
import { LANGS, LANGUAGE_TYPES } from '../../../../common/validators.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'
import LocalizedField from '../filterEdit/LocalizedField.tsx'

type LanguageDraft = {
  name: { fi: string; sv: string; en: string }
  lang: string
  languageType: string
  primaryLanguageSpecification: string
}

const SPECIFICATIONS = ['spoken', 'written']

const emptyDraft = (): LanguageDraft => ({
  name: { fi: '', sv: '', en: '' },
  lang: 'fi',
  languageType: '',
  primaryLanguageSpecification: '',
})

const toDraft = (language: RecommendationLanguage): LanguageDraft => ({
  name: { fi: language.name.fi, sv: language.name.sv, en: language.name.en },
  lang: language.lang,
  languageType: language.languageType ?? '',
  primaryLanguageSpecification: language.primaryLanguageSpecification ?? '',
})

type RecommendationLanguageDialogProps = {
  language: RecommendationLanguage | 'new'
  onClose: () => void
  onSaved: () => void
}

const RecommendationLanguageDialog = ({ language, onClose, onSaved }: RecommendationLanguageDialogProps) => {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<LanguageDraft>(language === 'new' ? emptyDraft() : toDraft(language))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const langSelectId = useId()
  const languageTypeSelectId = useId()
  const specificationSelectId = useId()

  const anyLabel = t('v2:admin.recommendationCodes.anyValue')

  const patchName = (lang: 'fi' | 'sv' | 'en', value: string) =>
    setDraft(current => ({ ...current, name: { ...current.name, [lang]: value } }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const isNew = language === 'new'
    const path = isNew ? '/api/admin/recommendation-languages' : `/api/admin/recommendation-languages/${language.id}`
    const payload = {
      name: draft.name,
      lang: draft.lang,
      languageType: draft.languageType === '' ? null : draft.languageType,
      primaryLanguageSpecification:
        draft.primaryLanguageSpecification === '' ? null : draft.primaryLanguageSpecification,
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
        {language === 'new'
          ? t('v2:admin.recommendationCodes.newLanguage')
          : t('v2:admin.recommendationCodes.editLanguage')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Alert severity="info" icon={false}>
            <Typography variant="body2">{t('v2:admin.recommendationCodes.languageIntro')}</Typography>
          </Alert>

          <LocalizedField
            values={draft.name}
            onChange={patchName}
            textFieldLabel={t('v2:admin.recommendationCodes.languageName')}
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel shrink id={langSelectId}>
              {t('v2:admin.recommendationCodes.lang')}
            </InputLabel>
            <Select
              labelId={langSelectId}
              label={t('v2:admin.recommendationCodes.lang')}
              value={draft.lang}
              onChange={e => setDraft(current => ({ ...current, lang: e.target.value }))}
            >
              {LANGS.map(lang => (
                <MenuItem key={lang} value={lang}>
                  {t(`v2:admin.recommendationCodes.langOption.${lang}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel shrink id={languageTypeSelectId}>
              {t('v2:admin.recommendationCodes.languageType')}
            </InputLabel>
            <Select
              labelId={languageTypeSelectId}
              label={t('v2:admin.recommendationCodes.languageType')}
              value={draft.languageType}
              displayEmpty
              renderValue={selected =>
                selected === '' ? anyLabel : t(`v2:admin.recommendationCodes.languageTypeOption.${selected}`)
              }
              onChange={e => setDraft(current => ({ ...current, languageType: e.target.value }))}
            >
              <MenuItem value="">{anyLabel}</MenuItem>
              {LANGUAGE_TYPES.map(languageType => (
                <MenuItem key={languageType} value={languageType}>
                  {t(`v2:admin.recommendationCodes.languageTypeOption.${languageType}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel shrink id={specificationSelectId}>
              {t('v2:admin.recommendationCodes.specification')}
            </InputLabel>
            <Select
              labelId={specificationSelectId}
              label={t('v2:admin.recommendationCodes.specification')}
              value={draft.primaryLanguageSpecification}
              displayEmpty
              renderValue={selected =>
                selected === '' ? anyLabel : t(`v2:admin.recommendationCodes.specificationOption.${selected}`)
              }
              onChange={e => setDraft(current => ({ ...current, primaryLanguageSpecification: e.target.value }))}
            >
              <MenuItem value="">{anyLabel}</MenuItem>
              {SPECIFICATIONS.map(specification => (
                <MenuItem key={specification} value={specification}>
                  {t(`v2:admin.recommendationCodes.specificationOption.${specification}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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

export default RecommendationLanguageDialog
