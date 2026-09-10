import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { RecommendationLanguage } from '../../../../common/types.ts'
import { LANGS, LANGUAGE_TYPES } from '../../../../common/validators.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'
import LocalizedField from '../filterEdit/LocalizedField.tsx'
import LabeledSelect from '../LabeledSelect.tsx'

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

          <LabeledSelect
            label={t('v2:admin.recommendationCodes.lang')}
            value={draft.lang}
            options={LANGS.map(lang => ({ value: lang, label: t(`v2:admin.recommendationCodes.langOption.${lang}`) }))}
            onChange={value => setDraft(current => ({ ...current, lang: value }))}
          />

          <LabeledSelect
            label={t('v2:admin.recommendationCodes.languageType')}
            value={draft.languageType}
            options={LANGUAGE_TYPES.map(languageType => ({
              value: languageType,
              label: t(`v2:admin.recommendationCodes.languageTypeOption.${languageType}`),
            }))}
            onChange={value => setDraft(current => ({ ...current, languageType: value }))}
            emptyLabel={anyLabel}
          />

          <LabeledSelect
            label={t('v2:admin.recommendationCodes.specification')}
            value={draft.primaryLanguageSpecification}
            options={SPECIFICATIONS.map(specification => ({
              value: specification,
              label: t(`v2:admin.recommendationCodes.specificationOption.${specification}`),
            }))}
            onChange={value => setDraft(current => ({ ...current, primaryLanguageSpecification: value }))}
            emptyLabel={anyLabel}
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

export default RecommendationLanguageDialog
