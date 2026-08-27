import { Box, Typography } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import type { SeriesLegendItemContext } from '@mui/x-charts/ChartsLegend'
import { useTranslation } from 'react-i18next'

import type { StatsRow } from './organisationGroups.ts'
import { legendSx, organisationSeries } from './statsChartData.ts'

const CHART_HEIGHT = 460

type VisitsBarChartProps = {
  rows: StatsRow[]
  hiddenOrganisations: string[]
  isLoading: boolean
  onToggleOrganisation: (groupKey: string) => void
}

const VisitsBarChart = ({ rows, hiddenOrganisations, isLoading, onToggleOrganisation }: VisitsBarChartProps) => {
  const { t } = useTranslation()
  const series = organisationSeries(rows, hiddenOrganisations)

  //the axis follows the visible organisations, not the unfiltered totals
  const maxCount = rows.reduce(
    (max, _row, index) =>
      Math.max(
        max,
        series.reduce((sum, item) => sum + (item.data[index] ?? 0), 0)
      ),
    0
  )

  if (isLoading || rows.length === 0) {
    return (
      <Box sx={{ height: CHART_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>{isLoading ? t('v2:admin.stats.loading') : t('v2:admin.stats.noVisits')}</Typography>
      </Box>
    )
  }

  return (
    <BarChart
      height={CHART_HEIGHT}
      margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
      onItemClick={(_event, barItem) => onToggleOrganisation(String(barItem.seriesId))}
      sx={{ '& .MuiBarChart-element': { cursor: 'pointer' } }}
      xAxis={[{ scaleType: 'band', data: rows.map(row => row.label), categoryGapRatio: 0.15, barGapRatio: 0 }]}
      yAxis={[{ min: 0, max: Math.max(4, maxCount + 1), tickMinStep: 1 }]}
      series={series}
      slotProps={{
        tooltip: { trigger: 'axis' },
        legend: {
          sx: legendSx(hiddenOrganisations),
          onItemClick: (_event: unknown, legendItem: SeriesLegendItemContext) =>
            onToggleOrganisation(String(legendItem.seriesId)),
        },
      }}
    />
  )
}

export default VisitsBarChart
