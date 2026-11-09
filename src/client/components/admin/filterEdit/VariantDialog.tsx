import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { FilterOption, FilterVariant } from '../../../../common/types.ts'
import { blankLocalized, type ValueDraft } from '../backendLocaleEdit/backendLocaleUtils.ts'
import ConditionSelectors from '../backendLocaleEdit/ConditionSelectors.tsx'
import VariantEditor from './VariantEditor.tsx'

interface VariantDialogProps {
  variant: FilterVariant
  onClose: () => void
  onPatchVariant: (fields: Partial<FilterVariant>) => void
  onPatchQuestion: (lang: 'fi' | 'sv' | 'en', val: string) => void
  onPatchExplanation: (lang: 'fi' | 'sv' | 'en', val: string) => void
  onUpdateOption: (oIdx: number, fields: Partial<FilterOption>) => void
  onUpdateOptionName: (oIdx: number, lang: 'fi' | 'sv' | 'en', val: string) => void
  onAddOption: () => void
  onRemoveOption: (oIdx: number) => void
}

const toConditionsDraft = (variant: FilterVariant): ValueDraft => ({
  organisationCode: variant.organisationCode ?? '',
  lang: variant.lang ?? '',
  primaryLanguage: variant.primaryLanguage ?? '',
  primaryLanguageSpecification: variant.primaryLanguageSpecification ?? '',
  text: blankLocalized(),
})

const VariantDialog = ({
  variant,
  onClose,
  onPatchVariant,
  onPatchQuestion,
  onPatchExplanation,
  onUpdateOption,
  onUpdateOptionName,
  onAddOption,
  onRemoveOption,
}: VariantDialogProps) => {
  const { t } = useTranslation()

  const handleConditionsChange = (patch: Partial<ValueDraft>) => {
    const fields: Partial<FilterVariant> = {}
    if ('organisationCode' in patch) fields.organisationCode = patch.organisationCode || null
    if ('lang' in patch) fields.lang = patch.lang || null
    if ('primaryLanguage' in patch) fields.primaryLanguage = patch.primaryLanguage || null
    if ('primaryLanguageSpecification' in patch) {
      fields.primaryLanguageSpecification = patch.primaryLanguageSpecification || null
    }
    onPatchVariant(fields)
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('v2:admin.filterEdit.variantDialogTitle')}</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" sx={{ mt: 1 }}>
          {t('v2:admin.filterEdit.conditionsSectionTitle')}
        </Typography>
        <ConditionSelectors draft={toConditionsDraft(variant)} onChange={handleConditionsChange} />

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t('v2:admin.filterEdit.contentSectionTitle')}
        </Typography>
        <VariantEditor
          variant={variant}
          variantIdx={0}
          onPatchVariant={onPatchVariant}
          onPatchQuestion={onPatchQuestion}
          onPatchExplanation={onPatchExplanation}
          onUpdateOption={onUpdateOption}
          onUpdateOptionName={onUpdateOptionName}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'black' }}>
          {t('v2:admin.filterEdit.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VariantDialog
