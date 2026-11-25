import { Alert, Paper, Stack, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { isCatchAll } from '../../../common/conditionMatching'
import type { FilterVariant } from '../../../common/types'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import type { ConditionDraft } from '../admin/backendLocaleEdit/backendLocaleUtils'
import ConditionSelectors from '../admin/backendLocaleEdit/ConditionSelectors'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import { describeFilterVariant } from './changeVariant'

export type VariantDraft = {
  name: string
  conditions: ConditionDraft
  skipped: boolean
  extraInfoDisabled: boolean
  deleted: boolean
}

export const toVariantDraft = (variant: FilterVariant): VariantDraft => ({
  name: variant.name,
  conditions: {
    organisationCode: variant.organisationCode ?? '',
    lang: variant.lang ?? '',
    primaryLanguage: variant.primaryLanguage ?? '',
    primaryLanguageSpecification: variant.primaryLanguageSpecification ?? '',
  },
  skipped: variant.skipped ?? false,
  extraInfoDisabled: variant.extraInfoDisabled ?? false,
  deleted: false,
})

type FilterVariantSettingsRowProps = {
  variant: FilterVariant
  draft: VariantDraft
  canDelete: boolean
  onChange: (change: Partial<VariantDraft>) => void
}

const FilterVariantSettingsRow = ({ variant, draft, canDelete, onChange }: FilterVariantSettingsRowProps) => {
  const { t } = useTranslation()
  const { isSuperuser } = useFilterEditMode()
  const label = describeFilterVariant(variant, t('v2:filterWordings.choice.default'))

  const body = (
    <>
      <TextField
        size="small"
        label={t('v2:filterSettings.variantName')}
        disabled={!isSuperuser}
        helperText={t('v2:filterSettings.variantNameWarning')}
        value={draft.name}
        onChange={event => onChange({ name: event.target.value })}
      />
      <ConditionSelectors
        draft={draft.conditions}
        onChange={patch => onChange({ conditions: { ...draft.conditions, ...patch } })}
      />
      {isCatchAll(variant) && <Alert severity="warning">{t('v2:filterSettings.catchAllWarning')}</Alert>}
    </>
  )

  const row = (
    <Paper variant="outlined" sx={{ p: 2, opacity: draft.deleted ? 0.5 : 1 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {label}
          </Typography>
          <BlackOutlinedButton
            type="button"
            disabled={!canDelete || !isSuperuser}
            onClick={() => onChange({ deleted: !draft.deleted })}
          >
            {draft.deleted ? t('v2:filterSettings.undoDelete') : t('v2:filterSettings.deleteVariant')}
          </BlackOutlinedButton>
        </Stack>
        {!draft.deleted && body}
      </Stack>
    </Paper>
  )

  return row
}

export default FilterVariantSettingsRow
