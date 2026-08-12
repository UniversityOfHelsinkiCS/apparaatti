import { Box, Typography } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'

import type { StatsOrganisation } from './organisationGroups.ts'
import { totalPie } from './statsChartData.ts'

const CHART_HEIGHT = 320

type UniqueUsersPieProps = {
  organisations: StatsOrganisation[]
  totalCount: number
  hiddenOrganisations: string[]
  isLoading: boolean
  onToggleOrganisation: (groupKey: string) => void
}

const UniqueUsersPie = ({
  organisations,
  totalCount,
  hiddenOrganisations,
  isLoading,
  onToggleOrganisation,
}: UniqueUsersPieProps) => {
  const pie = totalPie(organisations, hiddenOrganisations)

  return (
    <>
      <Typography variant="h6" align="center" sx={{ mt: 2, mb: 1 }}>
        Unique users in the range
      </Typography>

      <Box sx={{ height: CHART_HEIGHT, position: 'relative' }}>
        {isLoading || totalCount === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>{isLoading ? 'Loading stats...' : 'No visits in the selected range.'}</Typography>
          </Box>
        ) : (
          <>
            <PieChart
              height={CHART_HEIGHT}
              hideLegend
              onItemClick={(_event, _pieItem, item: { id?: string | number }) => onToggleOrganisation(String(item.id))}
              sx={{ '& .MuiPieChart-arc': { cursor: 'pointer' } }}
              series={[
                {
                  data: pie.data,
                  valueFormatter: pie.valueFormatter,
                  innerRadius: 70,
                  highlightScope: { fade: 'global', highlight: 'item' },
                },
              ]}
            />
            {/* hiding every organisation leaves the chart with its own no data message */}
            {pie.data.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="h4">{pie.total}</Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  )
}

export default UniqueUsersPie
