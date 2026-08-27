import { Box, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import type { GroupBy } from '../../../common/datelabels.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useApi from '../../util/useApi.tsx'
import useRequiredUser from '../../util/useRequiredUser.ts'
import AdminNavbar from './AdminNavbar.tsx'
import OrganisationFilterControls from './stats/OrganisationFilterControls.tsx'
import type { StatsResponse } from './stats/organisationGroups.ts'
import { organisationGroupKeys } from './stats/statsChartData.ts'
import StatsFilters, { getDefaultEnd, getDefaultStart } from './stats/StatsFilters.tsx'
import UniqueUsersPie from './stats/UniqueUsersPie.tsx'
import VisitsBarChart from './stats/VisitsBarChart.tsx'

const StatsPage = () => {
  const { t } = useTranslation()
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const [start, setStart] = useState(getDefaultStart)
  const [end, setEnd] = useState(getDefaultEnd)
  const [groupBy, setGroupBy] = useState<GroupBy>('day')
  const [hiddenOrganisations, setHiddenOrganisations] = useState<string[]>([])

  const toggleOrganisation = (groupKey: string) =>
    setHiddenOrganisations(previous =>
      previous.includes(groupKey) ? previous.filter(key => key !== groupKey) : [...previous, groupKey]
    )

  const startDateTime = `${start}T00:00:00.000Z`
  const endDateTime = `${end}T23:59:59.999Z`

  const endpoint = `/api/admin/stats?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}&groupBy=${encodeURIComponent(groupBy)}`

  const { data, isLoading } = useApi<StatsResponse>(`admin-stats-${start}-${end}-${groupBy}`, endpoint, 'GET')

  const groupedCounts = Array.isArray(data?.groups) ? data.groups : []
  const total = data?.total ?? { count: 0, organisations: [] }

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

      <StatsFilters
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
        groupKeys={organisationGroupKeys(groupedCounts)}
        hiddenOrganisations={hiddenOrganisations}
        onChange={setHiddenOrganisations}
      />

      <VisitsBarChart
        rows={groupedCounts}
        hiddenOrganisations={hiddenOrganisations}
        isLoading={isLoading}
        onToggleOrganisation={toggleOrganisation}
      />

      <UniqueUsersPie
        organisations={total.organisations}
        totalCount={total.count}
        hiddenOrganisations={hiddenOrganisations}
        isLoading={isLoading}
        onToggleOrganisation={toggleOrganisation}
      />
    </Box>
  )
}

export default StatsPage
