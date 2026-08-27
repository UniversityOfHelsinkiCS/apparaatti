import { Box, Divider, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import type { GroupBy } from '../../../common/datelabels.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useApi from '../../util/useApi.tsx'
import useRequiredUser from '../../util/useRequiredUser.ts'
import AdminNavbar from './AdminNavbar.tsx'
import OrganisationFilterControls from './stats/OrganisationFilterControls.tsx'
import {
  emptyStatsFilters,
  type StatsFilters,
  type StatsPhase,
  type StatsResponse,
} from './stats/organisationGroups.ts'
import ProgrammePie from './stats/ProgrammePie.tsx'
import { organisationGroupKeys } from './stats/statsChartData.ts'
import StatsFiltersControls, { getDefaultEnd, getDefaultStart } from './stats/StatsFilters.tsx'
import UniqueUsersPie from './stats/UniqueUsersPie.tsx'
import VisitsBarChart from './stats/VisitsBarChart.tsx'

const toggleKey = (keys: string[], key: string) =>
  keys.includes(key) ? keys.filter(existing => existing !== key) : [...keys, key]

const StatsPage = () => {
  const { t } = useTranslation()
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const [start, setStart] = useState(getDefaultStart)
  const [end, setEnd] = useState(getDefaultEnd)
  const [groupBy, setGroupBy] = useState<GroupBy>('day')
  const [filters, setFilters] = useState<StatsFilters>(emptyStatsFilters)

  const toggleOrganisation = (groupKey: string) =>
    setFilters(previous => ({ ...previous, organisations: toggleKey(previous.organisations, groupKey) }))

  const toggleProgramme = (phase: StatsPhase, programmeKey: string) =>
    setFilters(previous => ({ ...previous, [phase]: toggleKey(previous[phase], programmeKey) }))

  const startDateTime = `${start}T00:00:00.000Z`
  const endDateTime = `${end}T23:59:59.999Z`

  const endpoint = `/api/admin/stats?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}&groupBy=${encodeURIComponent(groupBy)}`

  const { data, isLoading } = useApi<StatsResponse>(`admin-stats-${start}-${end}-${groupBy}`, endpoint, 'GET')

  const groupedCounts = Array.isArray(data?.groups) ? data.groups : []
  const totalVisitors = data?.total?.visitors ?? []
  const programmeNames = data?.programmeNames ?? {}

  const hasHiddenFilters = filters.organisations.length > 0 || filters.phase1.length > 0 || filters.phase2.length > 0

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading) {
    return <div>{t('v2:admin.loading')}</div>
  }

  if (!user) {
    return <div>{t('v2:admin.loading')}</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <AdminNavbar isSuperuser={user.isSuperuser === true} />
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t('v2:admin.stats.pageTitle')}
      </Typography>

      <StatsFiltersControls
        start={start}
        end={end}
        groupBy={groupBy}
        onStartChange={setStart}
        onEndChange={setEnd}
        onGroupByChange={setGroupBy}
        onReset={() => {
          setGroupBy('day')
          setStart(getDefaultStart())
          setEnd(getDefaultEnd())
        }}
      />

      <OrganisationFilterControls
        groupKeys={organisationGroupKeys(totalVisitors)}
        hiddenOrganisations={filters.organisations}
        hasHiddenFilters={hasHiddenFilters}
        onHideAllOrganisations={() =>
          setFilters(previous => ({ ...previous, organisations: organisationGroupKeys(totalVisitors) }))
        }
        onShowAll={() => setFilters(emptyStatsFilters)}
      />

      <VisitsBarChart
        rows={groupedCounts}
        filters={filters}
        isLoading={isLoading}
        onToggleOrganisation={toggleOrganisation}
      />

      <Divider sx={{ my: 4 }} />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        divider={<Divider orientation="vertical" flexItem />}
        alignItems="stretch"
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <UniqueUsersPie
            visitors={totalVisitors}
            filters={filters}
            isLoading={isLoading}
            onToggleOrganisation={toggleOrganisation}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ProgrammePie
            visitors={totalVisitors}
            programmeNames={programmeNames}
            filters={filters}
            isLoading={isLoading}
            onToggleProgramme={toggleProgramme}
          />
        </Box>
      </Stack>
    </Box>
  )
}

export default StatsPage
