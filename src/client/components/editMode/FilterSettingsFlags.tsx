import { FormControlLabel, Stack, Switch, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { FilterConfig, FilterSettingsPatch } from '../../../common/types'
import { DISPLAY_TYPES, SWITCH_SX } from '../admin/filterEdit/filterEditorUtils'
import LabeledSelect from '../admin/LabeledSelect'
import { FILTER_FLAGS, type FilterFlag } from './filterSettingsMutations'

type FilterSettingsFlagsProps = {
  filter: FilterConfig
  patch: FilterSettingsPatch
  onPatch: (next: (current: FilterSettingsPatch) => FilterSettingsPatch) => void
}

const FilterSettingsFlags = ({ filter, patch, onPatch }: FilterSettingsFlagsProps) => {
  const { t } = useTranslation()

  const flagValue = (flag: FilterFlag): boolean => patch[flag] ?? filter[flag]
  const displayType = patch.displayType ?? filter.displayType ?? ''

  return (
    <Stack spacing={1.5}>
      {FILTER_FLAGS.map(flag => (
        <FormControlLabel
          key={flag}
          label={t(`v2:filterSettings.flag.${flag}`)}
          control={
            <Switch
              checked={flagValue(flag)}
              sx={SWITCH_SX}
              onChange={event => onPatch(current => ({ ...current, [flag]: event.target.checked }))}
            />
          }
        />
      ))}

      <LabeledSelect
        label={t('v2:filterSettings.displayType')}
        value={displayType}
        emptyLabel={t('v2:filterSettings.displayTypeNone')}
        options={DISPLAY_TYPES.map(type => ({ value: type, label: type }))}
        onChange={value => onPatch(current => ({ ...current, displayType: value === '' ? null : value }))}
      />

      <Typography variant="caption">{t('v2:filterSettings.enabledNote')}</Typography>
    </Stack>
  )
}

export default FilterSettingsFlags
