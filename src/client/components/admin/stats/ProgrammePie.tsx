import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import type { SeriesLegendItemContext } from '@mui/x-charts/ChartsLegend'
import { PieChart } from '@mui/x-charts/PieChart'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { StatsFilters, StatsPhase, StatsResponse, StatsVisitorGroup } from './organisationGroups.ts'
import { pieLegendSx, programmePie } from './statsChartData.ts'

const PIE_HEIGHT = 320
const PIE_CENTER = PIE_HEIGHT / 2
const LEGEND_HEIGHT = 110
const CHART_HEIGHT = PIE_HEIGHT + LEGEND_HEIGHT

type ProgrammePieProps = {
  visitors: StatsVisitorGroup[]
  programmeNames: StatsResponse['programmeNames']
  filters: StatsFilters
  isLoading: boolean
  onToggleProgramme: (phase: StatsPhase, programmeKey: string) => void
}

const ProgrammePie = ({ visitors, programmeNames, filters, isLoading, onToggleProgramme }: ProgrammePieProps) => {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<StatsPhase>('phase1')

  const pie = programmePie(visitors, filters, phase, programmeNames, t('v2:admin.stats.programmes.unknown'))
  const hiddenProgrammes = phase === 'phase1' ? filters.phase1 : filters.phase2

  return (
    <>
      <Typography variant="h6" align="center" sx={{ mb: 1 }}>
        {t('v2:admin.stats.programmes.title')}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={phase}
          onChange={(_event, value: StatsPhase | null) => value && setPhase(value)}
        >
          <ToggleButton value="phase1">{t('v2:admin.stats.programmes.phase1')}</ToggleButton>
          <ToggleButton value="phase2">{t('v2:admin.stats.programmes.phase2')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: CHART_HEIGHT, position: 'relative' }}>
        {isLoading || pie.data.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>{isLoading ? t('v2:admin.stats.loading') : t('v2:admin.stats.programmes.noData')}</Typography>
          </Box>
        ) : (
          <>
            <PieChart
              height={CHART_HEIGHT}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              onItemClick={(_event, _pieItem, item: { id?: string | number }) =>
                onToggleProgramme(phase, String(item.id))
              }
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
                  sx: pieLegendSx(pie.data, hiddenProgrammes),
                  onItemClick: (_event: unknown, legendItem: SeriesLegendItemContext) =>
                    onToggleProgramme(phase, String(pie.data[legendItem.dataIndex ?? -1]?.id)),
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

export default ProgrammePie
