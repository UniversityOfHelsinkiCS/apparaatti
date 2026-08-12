import { Box, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { type GroupBy, toDayLabel } from '../../../common/datelabels.ts'
import { organisationCodeToName } from '../../../common/organisations.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useApi from '../../util/useApi.tsx'
import useRequiredUser from '../../util/useRequiredUser.ts'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import AdminNavbar from './AdminNavbar.tsx'

type StatsOrganisation = {
  organisationCode: string | null
  count: number
  percentage: number
}

type StatsRow = {
  label: string
  count: number
  organisations: StatsOrganisation[]
}

const NO_ORGANISATION = 'none'
const OTHER_ORGANISATIONS = 'other'

const organisationColors: Record<string, string> = {
  [NO_ORGANISATION]: '#898781',
  H40: '#2a78d6',
  H50: '#eb6834',
  H20: '#1baf7a',
  H10: '#eda100',
  H74: '#e87ba4',
  H70: '#008300',
  H90: '#4a3aa7',
  H60: '#e34948',
  H57: '#184f95',
  H80: '#a63f18',
  '4141': '#0e6b4a',
  H305: '#8a5e00',
  H30: '#a1436a',
  H3456: '#004d00',
  '414': '#2c2266',
  H55: '#8f2b2a',
  [OTHER_ORGANISATIONS]: '#52514e',
}

const stackOrder = Object.keys(organisationColors)

const groupKeyOf = (organisationCode: string | null) => {
  if (organisationCode === null) {
    return NO_ORGANISATION
  }

  return organisationCode in organisationColors ? organisationCode : OTHER_ORGANISATIONS
}

const groupLabelOf = (groupKey: string) => {
  if (groupKey === NO_ORGANISATION) {
    return 'No organisation'
  }

  if (groupKey === OTHER_ORGANISATIONS) {
    return 'Other organisations'
  }

  return organisationCodeToName[groupKey] ?? groupKey
}

const visitsByGroup = (rows: StatsRow[]) => {
  const countsByGroup = new Map<string, number[]>()
  const percentagesByGroup = new Map<string, number[]>()

  rows.forEach((row, index) => {
    for (const organisation of row.organisations ?? []) {
      const groupKey = groupKeyOf(organisation.organisationCode)

      const counts = countsByGroup.get(groupKey) ?? new Array<number>(rows.length).fill(0)
      counts[index] += organisation.count
      countsByGroup.set(groupKey, counts)

      const percentages = percentagesByGroup.get(groupKey) ?? new Array<number>(rows.length).fill(0)
      percentages[index] += organisation.percentage
      percentagesByGroup.set(groupKey, percentages)
    }
  })

  return { countsByGroup, percentagesByGroup }
}

const organisationSeries = (rows: StatsRow[]) => {
  const { countsByGroup, percentagesByGroup } = visitsByGroup(rows)

  return stackOrder
    .filter(groupKey => countsByGroup.has(groupKey))
    .map(groupKey => ({
      data: countsByGroup.get(groupKey),
      label: groupLabelOf(groupKey),
      color: organisationColors[groupKey],
      stack: 'visits',
      valueFormatter: (value: number | null, { dataIndex }: { dataIndex: number }) => {
        if (!value) {
          return null
        }

        const percentage = percentagesByGroup.get(groupKey)?.[dataIndex] ?? 0
        return `${value} (${Number(percentage.toFixed(1))}%)`
      },
    }))
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

  const { data, isLoading } = useApi<StatsRow[]>(`admin-stats-${start}-${end}-${groupBy}`, endpoint, 'GET')

  const groupedCounts = Array.isArray(data) ? data : []

  const maxCount = groupedCounts.reduce((max, item) => Math.max(max, item.count), 0)
  const yAxisMax = Math.max(4, maxCount + 1)

  const series = organisationSeries(groupedCounts)

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
      <AdminNavbar isSuperuser={user.isSuperuser === true} />
      <Typography variant="h4" sx={{ mb: 2 }}>
        Usage Stats
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Start"
          type="date"
          value={start}
          onChange={event => setStart(event.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label="End"
          type="date"
          value={end}
          onChange={event => setEnd(event.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="stats-group-by-label">Group by</InputLabel>
          <Select
            labelId="stats-group-by-label"
            value={groupBy}
            label="Group by"
            onChange={event => setGroupBy(event.target.value as GroupBy)}
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
          height={460}
          margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
          xAxis={[
            { scaleType: 'band', data: groupedCounts.map(item => item.label), categoryGapRatio: 0.15, barGapRatio: 0 },
          ]}
          yAxis={[{ min: 0, max: yAxisMax, tickMinStep: 1 }]}
          series={series}
          slotProps={{ tooltip: { trigger: 'axis' } }}
        />
      )}
    </Box>
  )
}

export default StatsPage
