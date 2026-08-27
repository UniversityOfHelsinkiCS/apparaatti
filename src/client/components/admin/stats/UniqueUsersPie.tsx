import { Box, Typography } from '@mui/material'
import type { SeriesLegendItemContext } from '@mui/x-charts/ChartsLegend'
import { PieChart } from '@mui/x-charts/PieChart'
import { useTranslation } from 'react-i18next'

import type { StatsFilters, StatsVisitorGroup } from './organisationGroups.ts'
import { organisationPie, pieLegendSx } from './statsChartData.ts'

const PIE_HEIGHT = 320
const PIE_CENTER = PIE_HEIGHT / 2
const TOGGLE_ROW_HEIGHT = 34
const LEGEND_HEIGHT = 110
const CHART_HEIGHT = PIE_HEIGHT + LEGEND_HEIGHT

type UniqueUsersPieProps = {
  visitors: StatsVisitorGroup[]
  filters: StatsFilters
  isLoading: boolean
  onToggleOrganisation: (groupKey: string) => void
}

const UniqueUsersPie = ({ visitors, filters, isLoading, onToggleOrganisation }: UniqueUsersPieProps) => {
  const { t } = useTranslation()
  const pie = organisationPie(visitors, filters)

  return (
    <>
      <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
        {t('v2:admin.stats.faculty')}
      </Typography>

      <Box sx={{ height: TOGGLE_ROW_HEIGHT, mb: 1 }} />

      <Box sx={{ height: CHART_HEIGHT, position: 'relative' }}>
        {isLoading || pie.data.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>{isLoading ? t('v2:admin.stats.loading') : t('v2:admin.stats.noVisits')}</Typography>
          </Box>
        ) : (
          <>
            <PieChart
              height={CHART_HEIGHT}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              onItemClick={(_event, _pieItem, item: { id?: string | number }) => onToggleOrganisation(String(item.id))}
              sx={{ '& .MuiPieChart-arc': { cursor: 'pointer' } }}
              series={[
                {
                  data: pie.data,
                  valueFormatter: pie.valueFormatter,
                  cy: PIE_CENTER,
                  innerRadius: 70,
                  outerRadius: PIE_CENTER - 10,
                  highlightScope: { fade: 'global', highlight: 'item' },
                },
              ]}
              slotProps={{
                legend: {
                  direction: 'horizontal',
                  position: { vertical: 'bottom', horizontal: 'center' },
                  sx: pieLegendSx(pie.data, filters.organisations),
                  onItemClick: (_event: unknown, legendItem: SeriesLegendItemContext) =>
                    onToggleOrganisation(String(pie.data[legendItem.dataIndex ?? -1]?.id)),
                },
              }}
            />
            {pie.total > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: PIE_HEIGHT,
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
