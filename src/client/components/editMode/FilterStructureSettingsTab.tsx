import { Alert, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type {
  FilterConfig,
  FilterOption,
  FilterOptionSettings,
  FilterSettingsPatch,
  FilterVariant,
} from '../../../common/types'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import FilterOptionStructureRow from './FilterOptionStructureRow'
import type { VariantDraft } from './FilterVariantSettingsRow'
import FilterVariantsSection from './FilterVariantsSection'
import FilterWiringFields from './FilterWiringFields'

type FilterStructureSettingsTabProps = {
  filter: FilterConfig
  patch: FilterSettingsPatch
  onPatch: (next: (current: FilterSettingsPatch) => FilterSettingsPatch) => void
  variant: FilterVariant
  options: FilterOption[]
  optionDrafts: Record<string, FilterOptionSettings>
  deletedOptions: string[]
  variantDrafts: Record<string, VariantDraft>
  onVariantChange: (variant: FilterVariant, change: Partial<VariantDraft>) => void
  onOptionChange: (option: FilterOption, change: Partial<FilterOptionSettings>) => void
  onToggleDeletedOption: (option: FilterOption) => void
}

const FilterStructureSettingsTab = ({
  filter,
  patch,
  onPatch,
  variant,
  options,
  optionDrafts,
  deletedOptions,
  variantDrafts,
  onVariantChange,
  onOptionChange,
  onToggleDeletedOption,
}: FilterStructureSettingsTabProps) => {
  const { t } = useTranslation()
  const { isSuperuser } = useFilterEditMode()

  const tab = (
    <Stack spacing={3}>
      <Alert severity={isSuperuser ? 'warning' : 'info'}>
        {isSuperuser ? t('v2:filterSettings.structureWarning') : t('v2:filterSettings.superuserNote')}
      </Alert>

      <Stack spacing={1}>
        <Typography variant="subtitle2">{t('v2:filterSettings.wiringSection')}</Typography>
        <Typography variant="caption">{t('v2:filterSettings.allVariantsNote')}</Typography>
        <FilterWiringFields filter={filter} patch={patch} onPatch={onPatch} />
      </Stack>

      <FilterVariantsSection
        variants={filter.variants}
        drafts={variantDrafts}
        scope="structure"
        onChange={onVariantChange}
      />

      <Stack spacing={1}>
        <Typography variant="subtitle2">
          {t('v2:filterSettings.optionsSection', { variant: variant?.name ?? '' })}
        </Typography>
        <Typography variant="caption">{t('v2:filterSettings.thisVariantNote')}</Typography>
        {options.length === 0 && <Typography variant="body2">{t('v2:filterSettings.noOptions')}</Typography>}
        {options.map(option => (
          <FilterOptionStructureRow
            key={option.id}
            option={option}
            draft={optionDrafts[option.id]}
            isDeleted={deletedOptions.includes(option.id)}
            onChange={change => onOptionChange(option, change)}
            onDelete={() => onToggleDeletedOption(option)}
          />
        ))}
      </Stack>
    </Stack>
  )

  return tab
}

export default FilterStructureSettingsTab
