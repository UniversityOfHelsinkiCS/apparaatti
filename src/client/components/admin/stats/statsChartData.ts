import {
  groupKeyOf,
  groupLabelOf,
  organisationColors,
  stackOrder,
  type StatsOrganisation,
  type StatsRow,
} from './organisationGroups.ts'

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

//the organisations that appear anywhere in the range, in stacking order
export const organisationGroupKeys = (rows: StatsRow[]) => {
  const { countsByGroup } = visitsByGroup(rows)

  return stackOrder.filter(groupKey => countsByGroup.has(groupKey))
}

//hidden organisations keep their place in the legend but get zeroed out, so they can be clicked back
export const organisationSeries = (rows: StatsRow[], hiddenOrganisations: string[]) => {
  const { countsByGroup, percentagesByGroup } = visitsByGroup(rows)

  return stackOrder
    .filter(groupKey => countsByGroup.has(groupKey))
    .map(groupKey => {
      const counts = countsByGroup.get(groupKey) ?? []
      const isHidden = hiddenOrganisations.includes(groupKey)

      return {
        id: groupKey,
        data: isHidden ? counts.map(() => 0) : counts,
        label: groupLabelOf(groupKey),
        color: organisationColors[groupKey],
        stack: 'visits',
        highlightScope: { highlight: 'series', fade: 'global' } as const,
        valueFormatter: (value: number | null, { dataIndex }: { dataIndex: number }) => {
          if (!value) {
            return null
          }

          const percentage = percentagesByGroup.get(groupKey)?.[dataIndex] ?? 0
          return `${value} (${Number(percentage.toFixed(1))}%) — click to hide`
        },
      }
    })
}

//hidden organisations are left out entirely, the total follows the visible slices
export const totalPie = (organisations: StatsOrganisation[], hiddenOrganisations: string[]) => {
  const countsByGroup = new Map<string, number>()

  for (const organisation of organisations) {
    const groupKey = groupKeyOf(organisation.organisationCode)
    countsByGroup.set(groupKey, (countsByGroup.get(groupKey) ?? 0) + organisation.count)
  }

  const data = stackOrder
    .filter(groupKey => countsByGroup.has(groupKey) && !hiddenOrganisations.includes(groupKey))
    .map(groupKey => ({
      id: groupKey,
      value: countsByGroup.get(groupKey) ?? 0,
      label: groupLabelOf(groupKey),
      color: organisationColors[groupKey],
    }))

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const valueFormatter = (item: { value: number }) => {
    const percentage = total === 0 ? 0 : Number(((item.value / total) * 100).toFixed(1))
    return `${item.value} (${percentage}%) — click to hide`
  }

  return { data, total, valueFormatter }
}

export const legendSx = (hiddenOrganisations: string[]) => ({
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
    hiddenOrganisations.map(groupKey => [
      `& li[data-series="${groupKey}"]`,
      { opacity: 0.35, textDecoration: 'line-through', '&:hover': { opacity: 0.6 } },
    ])
  ),
})
