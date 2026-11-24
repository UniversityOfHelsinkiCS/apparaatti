import { Stack, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { FilterConfig, FilterSettingsPatch } from '../../../common/types'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'

type FilterWiringFieldsProps = {
  filter: FilterConfig
  patch: FilterSettingsPatch
  onPatch: (next: (current: FilterSettingsPatch) => FilterSettingsPatch) => void
}

const FilterWiringFields = ({ filter, patch, onPatch }: FilterWiringFieldsProps) => {
  const { t } = useTranslation()
  const { isSuperuser } = useFilterEditMode()

  const parentFilterId = patch.parentFilterId ?? filter.parentFilterId ?? ''
  const coordinateKey = patch.coordinateKey ?? filter.coordinateKey ?? ''

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label={t('v2:filterSettings.parentFilterId')}
        disabled={!isSuperuser}
        value={parentFilterId}
        onChange={event =>
          onPatch(current => ({ ...current, parentFilterId: event.target.value === '' ? null : event.target.value }))
        }
      />

      <TextField
        size="small"
        label={t('v2:filterSettings.coordinateKey')}
        disabled={!isSuperuser}
        helperText={t('v2:filterSettings.coordinateKeyWarning')}
        value={coordinateKey}
        onChange={event =>
          onPatch(current => ({ ...current, coordinateKey: event.target.value === '' ? null : event.target.value }))
        }
      />
    </Stack>
  )
}

export default FilterWiringFields
