import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { describeVariantQuery, type VariantQuery } from '../../../common/conditionMatching'
import type { FilterVariant } from '../../../common/types'
import { useFilterContext } from '../../contexts/filterContext'
import ConditionSelectors from '../admin/backendLocaleEdit/ConditionSelectors'
import LabeledSelect from '../admin/LabeledSelect'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import { describeFilterVariant, normalizeVariantQuery, queryForVariant } from './changeVariant'

type ChangeVariantDialogProps = {
  onClose: () => void
  /** Called after the answers have been changed to the chosen variant. */
  onApplied?: () => void
  /** Existing variants of the filter being edited; offered as quick picks. */
  filterVariants?: FilterVariant[]
  /** Shows a warning that applying discards the unsaved text. */
  hasUnsavedChanges?: boolean
}

/** Mount only while open: the draft starts from the current answers on each mount. */
const ChangeVariantDialog = ({ onClose, onApplied, filterVariants, hasUnsavedChanges }: ChangeVariantDialogProps) => {
  const { t } = useTranslation()
  const {
    variantQuery,
    setStudyField,
    setUserOrgCode,
    setLanguage,
    setPrimaryLanguage,
    setPrimaryLanguageSpecification,
  } = useFilterContext()
  const [draft, setDraft] = useState<VariantQuery>(variantQuery)
  const [pickedVariantName, setPickedVariantName] = useState('')

  const result = normalizeVariantQuery(draft)

  const patchDraft = (patch: Partial<VariantQuery>) => {
    setPickedVariantName('')
    setDraft(current => ({ ...current, ...patch }))
  }

  const pickVariant = (variantName: string) => {
    setPickedVariantName(variantName)
    const variant = filterVariants?.find(candidate => candidate.name === variantName)
    if (variant) {
      setDraft(current => queryForVariant(variant, current))
    }
  }

  const apply = () => {
    setStudyField(result.organisationCode)
    setUserOrgCode(result.organisationCode)
    setLanguage(result.lang)
    setPrimaryLanguage(result.primaryLanguage)
    setPrimaryLanguageSpecification(result.primaryLanguageSpecification)
    onApplied?.()
    onClose()
  }

  const defaultLabel = t('v2:filterWordings.choice.default')

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth data-testid="change-variant-dialog">
      <DialogTitle>{t('v2:filterWordings.changeVariant.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Alert severity="info" icon={false}>
            <Typography variant="subtitle2">{describeVariantQuery(variantQuery)}</Typography>
            <Typography variant="body2">{t('v2:filterWordings.changeVariant.intro')}</Typography>
          </Alert>

          {hasUnsavedChanges && <Alert severity="warning">{t('v2:filterWordings.changeVariant.unsavedWarning')}</Alert>}

          {filterVariants && filterVariants.length > 0 && (
            <>
              <Typography variant="subtitle2">{t('v2:filterWordings.changeVariant.existingVariants')}</Typography>
              <LabeledSelect
                label={t('v2:filterWordings.changeVariant.pickExisting')}
                value={pickedVariantName}
                options={filterVariants.map(variant => ({
                  value: variant.name,
                  label: describeFilterVariant(variant, defaultLabel),
                }))}
                onChange={pickVariant}
                emptyLabel={t('v2:filterWordings.changeVariant.noPick')}
              />
            </>
          )}

          <Typography variant="subtitle2">{t('v2:filterWordings.changeVariant.conditionsTitle')}</Typography>
          <ConditionSelectors draft={draft} onChange={patchDraft} />

          <Typography variant="body2">
            {t('v2:filterWordings.changeVariant.preview', { variant: describeVariantQuery(result) })}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose}>{t('v2:filterWordings.changeVariant.cancel')}</BlackOutlinedButton>
        <Button variant="contained" color="secondary" onClick={apply}>
          {t('v2:filterWordings.changeVariant.apply')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ChangeVariantDialog
