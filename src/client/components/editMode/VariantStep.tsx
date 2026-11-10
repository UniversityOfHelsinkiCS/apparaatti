import { Alert, Button, DialogActions, DialogContent, Stack } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isCatchAll, type VariantQuery } from '../../../common/conditionMatching'
import type { FilterVariant } from '../../../common/types'
import type { ConditionDraft } from '../admin/backendLocaleEdit/backendLocaleUtils'
import ConditionSelectors from '../admin/backendLocaleEdit/ConditionSelectors'
import LabeledSelect from '../admin/LabeledSelect'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import { describeFilterVariant } from './changeVariant'
import type { PickedTarget } from './wordingMutations'

const NEW_VARIANT = '__new__'

const draftFrom = (picked: PickedTarget, variantQuery: VariantQuery): ConditionDraft =>
  picked.mode === 'new'
    ? {
        organisationCode: picked.conditions.organisationCode ?? '',
        lang: picked.conditions.lang ?? '',
        primaryLanguage: picked.conditions.primaryLanguage ?? '',
        primaryLanguageSpecification: picked.conditions.primaryLanguageSpecification ?? '',
      }
    : variantQuery

type VariantStepProps = {
  filterVariants: FilterVariant[]
  variantQuery: VariantQuery
  picked: PickedTarget
  hasUnsavedChanges: boolean
  onCancel: () => void
  onContinue: (picked: PickedTarget) => void
}

/** Step 1 of the wording editor: confirm, or change, which variant the text is saved to. */
const VariantStep = ({
  filterVariants,
  variantQuery,
  picked,
  hasUnsavedChanges,
  onCancel,
  onContinue,
}: VariantStepProps) => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(picked.mode === 'new' ? NEW_VARIANT : picked.variantName)
  const [draft, setDraft] = useState<ConditionDraft>(() => draftFrom(picked, variantQuery))

  const selectedVariant = filterVariants.find(variant => variant.name === selected)

  const continueWithSelection = () => {
    if (selected !== NEW_VARIANT) {
      onContinue({ mode: 'existing', variantName: selected })
      return
    }
    onContinue({
      mode: 'new',
      conditions: {
        organisationCode: draft.organisationCode || null,
        lang: draft.lang || null,
        primaryLanguage: draft.primaryLanguage || null,
        primaryLanguageSpecification: draft.primaryLanguageSpecification || null,
      },
    })
  }

  return (
    <>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {hasUnsavedChanges && <Alert severity="warning">{t('v2:filterWordings.target.unsavedWarning')}</Alert>}

          <LabeledSelect
            label={t('v2:filterWordings.target.variant')}
            value={selected}
            options={[
              ...filterVariants.map(variant => ({
                value: variant.name,
                label: describeFilterVariant(variant, t('v2:filterWordings.choice.default')),
              })),
              { value: NEW_VARIANT, label: t('v2:filterWordings.choice.createNew') },
            ]}
            onChange={setSelected}
          />

          {selected === NEW_VARIANT && (
            <ConditionSelectors draft={draft} onChange={patch => setDraft(current => ({ ...current, ...patch }))} />
          )}

          {selectedVariant && isCatchAll(selectedVariant) && (
            <Alert severity="warning">{t('v2:filterWordings.popover.defaultWarning')}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onCancel}>
          {t('v2:filterWordings.popover.cancel')}
        </BlackOutlinedButton>
        <Button variant="contained" color="secondary" onClick={continueWithSelection}>
          {t('v2:filterWordings.choice.continue')}
        </Button>
      </DialogActions>
    </>
  )
}

export default VariantStep
