import { Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type {
  FilterConfig,
  FilterOption,
  FilterOptionSettings,
  FilterSettingsPatch,
  FilterVariant,
  LocalizedText,
} from '../../../common/types'
import FilterOptionAddRow from './FilterOptionAddRow'
import FilterOptionSettingsRow from './FilterOptionSettingsRow'
import FilterSettingsFlags from './FilterSettingsFlags'
import type { VariantDraft } from './FilterVariantSettingsRow'
import FilterVariantsSection from './FilterVariantsSection'

type FilterBasicSettingsTabProps = {
  filter: FilterConfig
  patch: FilterSettingsPatch
  onPatch: (next: (current: FilterSettingsPatch) => FilterSettingsPatch) => void
  variant: FilterVariant
  options: FilterOption[]
  optionDrafts: Record<string, FilterOptionSettings>
  addedOptions: { optionId: string; name: LocalizedText }[]
  variantDrafts: Record<string, VariantDraft>
  onVariantChange: (variant: FilterVariant, change: Partial<VariantDraft>) => void
  onOptionChange: (option: FilterOption, change: Partial<FilterOptionSettings>) => void
  onAddOption: (optionId: string, name: LocalizedText) => void
}

const FilterBasicSettingsTab = ({
  filter,
  patch,
  onPatch,
  variant,
  options,
  optionDrafts,
  addedOptions,
  variantDrafts,
  onVariantChange,
  onOptionChange,
  onAddOption,
}: FilterBasicSettingsTabProps) => {
  const { t } = useTranslation()

  const tab = (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">{t('v2:filterSettings.filterSection')}</Typography>
        <Typography variant="caption">{t('v2:filterSettings.allVariantsNote')}</Typography>
        <FilterSettingsFlags filter={filter} patch={patch} onPatch={onPatch} />
      </Stack>

      <FilterVariantsSection
        variants={filter.variants}
        drafts={variantDrafts}
        scope="basic"
        onChange={onVariantChange}
      />

      <Stack spacing={1}>
        <Typography variant="subtitle2">
          {t('v2:filterSettings.optionsSection', { variant: variant?.name ?? '' })}
        </Typography>
        <Typography variant="caption">{t('v2:filterSettings.thisVariantNote')}</Typography>
        {options.length === 0 && <Typography variant="body2">{t('v2:filterSettings.noOptions')}</Typography>}
        {options.map(option => (
          <FilterOptionSettingsRow
            key={option.id}
            option={option}
            draft={optionDrafts[option.id]}
            onChange={change => onOptionChange(option, change)}
          />
        ))}
        {addedOptions.map(added => (
          <Typography variant="body2" key={added.optionId}>
            {t('v2:filterSettings.pendingOption', { option: added.optionId })}
          </Typography>
        ))}
        <FilterOptionAddRow onAdd={onAddOption} />
      </Stack>
    </Stack>
  )

  return tab
}

export default FilterBasicSettingsTab
