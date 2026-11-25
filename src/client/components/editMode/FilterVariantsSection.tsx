import { FormControlLabel, Paper, Stack, Switch, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { FilterVariant } from '../../../common/types'
import { SWITCH_SX } from '../admin/filterEdit/filterEditorUtils'
import { describeFilterVariant } from './changeVariant'
import FilterVariantSettingsRow, { toVariantDraft, type VariantDraft } from './FilterVariantSettingsRow'

type FilterVariantsSectionProps = {
  variants: FilterVariant[]
  drafts: Record<string, VariantDraft>
  scope: 'basic' | 'structure'
  onChange: (variant: FilterVariant, change: Partial<VariantDraft>) => void
}

const FilterVariantsSection = ({ variants, drafts, scope, onChange }: FilterVariantsSectionProps) => {
  const { t } = useTranslation()
  const liveCount = variants.filter(variant => !drafts[variant.name]?.deleted).length

  const skipRow = (variant: FilterVariant) => {
    const draft = drafts[variant.name] ?? toVariantDraft(variant)
    return (
      <Paper variant="outlined" key={variant.name} sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {describeFilterVariant(variant, t('v2:filterWordings.choice.default'))}
          </Typography>
          <Stack>
            <FormControlLabel
              label={t('v2:filterSettings.skipped')}
              control={
                <Switch
                  checked={draft.skipped}
                  sx={SWITCH_SX}
                  onChange={event => onChange(variant, { skipped: event.target.checked })}
                />
              }
            />
            <FormControlLabel
              label={t('v2:filterSettings.extraInfoDisabled')}
              control={
                <Switch
                  checked={draft.extraInfoDisabled}
                  sx={SWITCH_SX}
                  onChange={event => onChange(variant, { extraInfoDisabled: event.target.checked })}
                />
              }
            />
          </Stack>
        </Stack>
      </Paper>
    )
  }

  const structureRow = (variant: FilterVariant) => (
    <FilterVariantSettingsRow
      key={variant.name}
      variant={variant}
      draft={drafts[variant.name] ?? toVariantDraft(variant)}
      canDelete={liveCount > 1 || drafts[variant.name]?.deleted === true}
      onChange={change => onChange(variant, change)}
    />
  )

  const note = scope === 'basic' ? t('v2:filterSettings.variantsSkipNote') : t('v2:filterSettings.variantsNote')

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">{t('v2:filterSettings.variantsSection')}</Typography>
      <Typography variant="caption">{note}</Typography>
      {variants.map(variant => (scope === 'basic' ? skipRow(variant) : structureRow(variant)))}
    </Stack>
  )
}

export default FilterVariantsSection
