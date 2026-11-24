import { FormControlLabel, Paper, Stack, Switch, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { FilterOption, FilterOptionSettings } from '../../../common/types'
import { SWITCH_SX } from '../admin/filterEdit/filterEditorUtils'
import OptionTextEditHandle from './OptionTextEditHandle'

type FilterOptionSettingsRowProps = {
  option: FilterOption
  draft: FilterOptionSettings | undefined
  onChange: (change: Partial<FilterOptionSettings>) => void
}

const FilterOptionSettingsRow = ({ option, draft, onChange }: FilterOptionSettingsRowProps) => {
  const { t } = useTranslation()
  const valueOverride = draft?.valueOverride ?? option.valueOverride ?? ''
  const selectedByDefault = draft?.selectedByDefault ?? option.selectedByDefault ?? false

  const row = (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {option.name.fi}
          </Typography>
          <OptionTextEditHandle optionId={option.id} name={option.name.fi} />
        </Stack>
        <TextField
          size="small"
          label={t('v2:filterSettings.valueOverride')}
          value={valueOverride}
          onChange={event => onChange({ valueOverride: event.target.value === '' ? null : event.target.value })}
        />
        <FormControlLabel
          label={t('v2:filterSettings.selectedByDefault')}
          control={
            <Switch
              checked={selectedByDefault}
              sx={SWITCH_SX}
              onChange={event => onChange({ selectedByDefault: event.target.checked })}
            />
          }
        />
      </Stack>
    </Paper>
  )

  return row
}

export default FilterOptionSettingsRow
