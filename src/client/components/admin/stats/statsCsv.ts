import { translateLocalizedString } from '../../../util/i18n.ts'
import {
  groupKeyOf,
  groupLabelOf,
  isVisitorVisible,
  programmeKeyOf,
  type StatsFilters,
  type StatsResponse,
  type StatsRow,
} from './organisationGroups.ts'

const escapeCell = (value: string | number) => {
  const cell = String(value)

  return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell
}

export const statsCsv = (
  rows: StatsRow[],
  filters: StatsFilters,
  programmeNames: StatsResponse['programmeNames'],
  headers: string[],
  unknownLabel: string
) => {
  const programmeLabel = (code: string | null) => {
    const name = programmeNames?.[programmeKeyOf(code)]

    return name ? translateLocalizedString(name) : unknownLabel
  }

  const lines = [headers]

  for (const row of rows) {
    for (const visitor of row.visitors ?? []) {
      if (!isVisitorVisible(visitor, filters)) {
        continue
      }

      lines.push([
        row.label,
        groupLabelOf(groupKeyOf(visitor.organisationCode)),
        programmeLabel(visitor.phase1Code),
        programmeLabel(visitor.phase2Code),
        String(visitor.count),
      ])
    }
  }

  return lines.map(line => line.map(escapeCell).join(',')).join('\n')
}

const BOM = String.fromCharCode(0xfeff)

export const downloadCsv = (fileName: string, csv: string) => {
  const url = URL.createObjectURL(new Blob([`${BOM}${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
}
