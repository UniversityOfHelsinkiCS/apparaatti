export type GroupBy = 'hour' | 'day' | 'month' | 'year'

export const toHourLabel = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hour = String(date.getUTCHours()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:00`
}

export const toDayLabel = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const toMonthLabel = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export const toYearLabel = (date: Date) => String(date.getUTCFullYear())

export const getGroupLabel = (date: Date, groupBy: GroupBy) => {
  switch (groupBy) {
    case 'hour':
      return toHourLabel(date)
    case 'year':
      return toYearLabel(date)
    case 'month':
      return toMonthLabel(date)
    case 'day':
    default:
      return toDayLabel(date)
  }
}

const MAX_LABELS = 10000

export const startOfGroup = (date: Date, groupBy: GroupBy) => {
  const start = new Date(date)

  switch (groupBy) {
    case 'hour':
      start.setUTCMinutes(0, 0, 0)
      break
    case 'year':
      start.setUTCMonth(0, 1)
      start.setUTCHours(0, 0, 0, 0)
      break
    case 'month':
      start.setUTCDate(1)
      start.setUTCHours(0, 0, 0, 0)
      break
    case 'day':
    default:
      start.setUTCHours(0, 0, 0, 0)
  }

  return start
}

//every label between start and end in order, so that groups without visits can be shown as 0
export const getGroupLabels = (start: Date, end: Date, groupBy: GroupBy) => {
  const labels: string[] = []
  const cursor = startOfGroup(start, groupBy)

  while (cursor <= end && labels.length < MAX_LABELS) {
    labels.push(getGroupLabel(cursor, groupBy))

    switch (groupBy) {
      case 'hour':
        cursor.setUTCHours(cursor.getUTCHours() + 1)
        break
      case 'year':
        cursor.setUTCFullYear(cursor.getUTCFullYear() + 1)
        break
      case 'month':
        cursor.setUTCMonth(cursor.getUTCMonth() + 1)
        break
      case 'day':
      default:
        cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
  }

  return labels
}
