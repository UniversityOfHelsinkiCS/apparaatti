import { translateLocalizedString } from '../../../util/i18n.ts'
import {
  groupKeyOf,
  groupLabelOf,
  isVisitorVisible,
  organisationColors,
  programmeCodeOf,
  programmeKeyOf,
  programmePalette,
  stackOrder,
  type StatsFilters,
  type StatsPhase,
  type StatsResponse,
  type StatsRow,
  type StatsVisitorGroup,
  UNKNOWN_PROGRAMME,
  UNKNOWN_PROGRAMME_COLOR,
} from './organisationGroups.ts'

const percentageOf = (part: number, total: number) => (total === 0 ? 0 : Number(((part / total) * 100).toFixed(1)))

const organisationCounts = (visitors: StatsVisitorGroup[], filters: StatsFilters) => {
  const counts = new Map<string, number>()

  for (const visitor of visitors) {
    const groupKey = groupKeyOf(visitor.organisationCode)
    const visible = isVisitorVisible(visitor, filters)
    counts.set(groupKey, (counts.get(groupKey) ?? 0) + (visible ? visitor.count : 0))
  }

  return counts
}

export const organisationGroupKeys = (visitors: StatsVisitorGroup[]) => {
  const present = new Set(visitors.map(visitor => groupKeyOf(visitor.organisationCode)))

  return stackOrder.filter(groupKey => present.has(groupKey))
}

export const organisationSeries = (rows: StatsRow[], filters: StatsFilters) => {
  const countsPerRow = rows.map(row => organisationCounts(row.visitors ?? [], filters))
  const totalsPerRow = countsPerRow.map(counts => Array.from(counts.values()).reduce((sum, count) => sum + count, 0))
  const groupKeys = organisationGroupKeys(rows.flatMap(row => row.visitors ?? []))

  return groupKeys.map(groupKey => ({
    id: groupKey,
    data: countsPerRow.map(counts => counts.get(groupKey) ?? 0),
    label: groupLabelOf(groupKey),
    color: organisationColors[groupKey],
    stack: 'visits',
    highlightScope: { highlight: 'series', fade: 'global' } as const,
    valueFormatter: (value: number | null, { dataIndex }: { dataIndex: number }) => {
      if (!value) {
        return null
      }

      return `${value} (${percentageOf(value, totalsPerRow[dataIndex] ?? 0)}%) — click to hide`
    },
  }))
}

export const organisationPie = (visitors: StatsVisitorGroup[], filters: StatsFilters) => {
  const counts = organisationCounts(visitors, filters)

  const data = organisationGroupKeys(visitors).map(groupKey => ({
    id: groupKey,
    value: counts.get(groupKey) ?? 0,
    label: groupLabelOf(groupKey),
    color: organisationColors[groupKey],
  }))

  return pie(data)
}

export const programmePie = (
  visitors: StatsVisitorGroup[],
  filters: StatsFilters,
  phase: StatsPhase,
  programmeNames: StatsResponse['programmeNames'],
  unknownLabel: string
) => {
  const unfilteredCounts = new Map<string, number>()
  const visibleCounts = new Map<string, number>()

  for (const visitor of visitors) {
    const key = programmeKeyOf(programmeCodeOf(visitor, phase))
    unfilteredCounts.set(key, (unfilteredCounts.get(key) ?? 0) + visitor.count)

    if (isVisitorVisible(visitor, filters)) {
      visibleCounts.set(key, (visibleCounts.get(key) ?? 0) + visitor.count)
    }
  }

  const data = Array.from(unfilteredCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([key, _unfilteredCount], index) => {
      const name = programmeNames?.[key]

      return {
        id: key,
        value: visibleCounts.get(key) ?? 0,
        label: name ? translateLocalizedString(name) : unknownLabel,
        color: key === UNKNOWN_PROGRAMME ? UNKNOWN_PROGRAMME_COLOR : programmePalette[index % programmePalette.length],
      }
    })

  return pie(data)
}

const pie = (data: { id: string; value: number; label: string; color: string }[]) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const valueFormatter = (item: { value: number }) =>
    `${item.value} (${percentageOf(item.value, total)}%) — click to hide`

  return { data, total, valueFormatter }
}

export const legendSx = (hiddenKeys: string[]) => ({
  '&& li button': {
    borderRadius: 1,
    px: 0.75,
    py: 0.5,
    transition: 'background-color 150ms ease, opacity 150ms ease',
    '&:hover': { backgroundColor: 'action.hover' },
    '&:active': { backgroundColor: 'action.selected' },
    '&:focus-visible': { outline: '2px solid', outlineOffset: 2 },
  },
  ...Object.fromEntries(
    hiddenKeys.map(groupKey => [
      `& li[data-series="${groupKey}"]`,
      { opacity: 0.35, textDecoration: 'line-through', '&:hover': { opacity: 0.6 } },
    ])
  ),
})

const HIDDEN_LEGEND_ITEM_SX = { opacity: 0.35, textDecoration: 'line-through', '&:hover': { opacity: 0.6 } }

export const pieLegendSx = (data: { id: string }[], hiddenSlices: string[]) => ({
  ...legendSx([]),
  ...Object.fromEntries(
    data
      .map((slice, index) => ({ slice, index }))
      .filter(({ slice }) => hiddenSlices.includes(slice.id))
      .map(({ index }) => [`& li[data-index="${index}"]`, HIDDEN_LEGEND_ITEM_SX])
  ),
})
