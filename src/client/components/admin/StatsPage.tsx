
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { Navigate } from 'react-router-dom'
import { useState } from 'react'
import { toDayLabel, type GroupBy } from '../../../common/datelabels.ts'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import useRequiredUser from '../../util/useRequiredUser.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useApi from '../../util/useApi.tsx'

type StatsRow = {
    label: string
    count: number
}

const getDefaultStart = () => {
  const date = new Date()
  date.setDate(date.getDate() - 13)
  return toDayLabel(date)
}

const getDefaultEnd = () => toDayLabel(new Date())

const StatsPage = () => {
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const [start, setStart] = useState(getDefaultStart)
  const [end, setEnd] = useState(getDefaultEnd)
  const [groupBy, setGroupBy] = useState<GroupBy>('day')

  const startDateTime = `${start}T00:00:00.000Z`
  const endDateTime = `${end}T23:59:59.999Z`

  const endpoint = `/api/admin/stats?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}&groupBy=${encodeURIComponent(groupBy)}`

  const { data, isLoading } = useApi(
    `admin-stats-${start}-${end}-${groupBy}`,
    endpoint,
    'GET',
    null
  ) as { data: StatsRow[] | null; isLoading: boolean }

  const groupedCounts = Array.isArray(data) ? data : []

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
                Usage Stats
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Start"
          type="date"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="End"
          type="date"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="stats-group-by-label">Group by</InputLabel>
          <Select
            labelId="stats-group-by-label"
            value={groupBy}
            label="Group by"
            onChange={(event) => setGroupBy(event.target.value as GroupBy)}
          >
            <MenuItem value="hour">Hour</MenuItem>
            <MenuItem value="day">Day</MenuItem>
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="year">Year</MenuItem>
          </Select>
        </FormControl>
        <BlackOutlinedButton
          onClick={() => {
            setGroupBy('day')
            setStart(getDefaultStart())
            setEnd(getDefaultEnd())
          }}
        >
                    Last 14 days
        </BlackOutlinedButton>
      </Stack>

      {isLoading ? (
        <Typography>Loading stats...</Typography>
      ) : groupedCounts.length === 0 ? (
        <Typography>No visits in the selected range.</Typography>
      ) : (
        <BarChart
          height={420}
          margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
          xAxis={[{ scaleType: 'band', data: groupedCounts.map((item) => item.label) }]}
          series={[{ data: groupedCounts.map((item) => item.count), label: 'Visits' }]}
        />
      )}
    </Box>
  )
}

export default StatsPage