import { FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material'

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
}: StatsFiltersProps) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
    <TextField
      label="Start"
      type="date"
      value={start}
      onChange={event => onStartChange(event.target.value)}
      InputLabelProps={{ shrink: true }}
      size="small"
    />
    <TextField
      label="End"
      type="date"
      value={end}
      onChange={event => onEndChange(event.target.value)}
      InputLabelProps={{ shrink: true }}
      size="small"
    />
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <InputLabel id="stats-group-by-label">Group by</InputLabel>
      <Select
        labelId="stats-group-by-label"
        value={groupBy}
        label="Group by"
        onChange={event => onGroupByChange(event.target.value as GroupBy)}
      >
        <MenuItem value="hour">Hour</MenuItem>
        <MenuItem value="day">Day</MenuItem>
        <MenuItem value="month">Month</MenuItem>
        <MenuItem value="year">Year</MenuItem>
      </Select>
    </FormControl>
    <BlackOutlinedButton onClick={onReset}>Last 14 days</BlackOutlinedButton>
  </Stack>
)

export default StatsFilters
