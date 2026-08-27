import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { type GroupBy, toDayLabel } from '../../../../common/datelabels.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

export const getDefaultStart = () => {
  const date = new Date()
  date.setDate(date.getDate() - 13)
  return toDayLabel(date)
}

export const getDefaultEnd = () => toDayLabel(new Date())

type StatsFiltersProps = {
  start: string
  end: string
  groupBy: GroupBy
  onStartChange: (start: string) => void
  onEndChange: (end: string) => void
  onGroupByChange: (groupBy: GroupBy) => void
  onReset: () => void
}

const StatsFilters = ({
  start,
  end,
  groupBy,
  onStartChange,
  onEndChange,
  onGroupByChange,
  onReset,
}: StatsFiltersProps) => {
  const { t } = useTranslation()

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
      <TextField
        label={t('v2:admin.stats.start')}
        type="date"
        value={start}
        onChange={event => onStartChange(event.target.value)}
        InputLabelProps={{ shrink: true }}
        size="small"
      />
      <TextField
        label={t('v2:admin.stats.end')}
        type="date"
        value={end}
        onChange={event => onEndChange(event.target.value)}
        InputLabelProps={{ shrink: true }}
        size="small"
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="stats-group-by-label">{t('v2:admin.stats.groupBy')}</InputLabel>
        <Select
          labelId="stats-group-by-label"
          value={groupBy}
          label={t('v2:admin.stats.groupBy')}
          onChange={event => onGroupByChange(event.target.value as GroupBy)}
        >
          <MenuItem value="hour">{t('v2:admin.stats.hour')}</MenuItem>
          <MenuItem value="day">{t('v2:admin.stats.day')}</MenuItem>
          <MenuItem value="month">{t('v2:admin.stats.month')}</MenuItem>
          <MenuItem value="year">{t('v2:admin.stats.year')}</MenuItem>
        </Select>
      </FormControl>
      <BlackOutlinedButton onClick={onReset}>{t('v2:admin.stats.last14Days')}</BlackOutlinedButton>
    </Stack>
  )
}

export default StatsFilters
