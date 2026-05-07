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