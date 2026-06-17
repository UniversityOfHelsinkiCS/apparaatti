import type { CourseData } from '../../common/types'
import type { SortDirection, SortMode } from '../components/CourseSortControls'
import { translateLocalizedString } from './i18n'

export const getEarliestPeriodStart = (c: CourseData): number => {
  if (!c.period || c.period.length === 0) {
    return new Date(c.startDate).getTime()
  }
  return Math.min(...c.period.map(p => new Date(p.startDate).getTime()))
}

export const sortCourses = (courses: CourseData[], mode: SortMode, direction: SortDirection = 'asc'): CourseData[] => {
  if (mode === 'recommended') return courses
  const factor = direction === 'asc' ? 1 : -1
  return [...courses].sort((a, b) => {
    if (mode === 'name') {
      return factor * translateLocalizedString(a.name).localeCompare(translateLocalizedString(b.name))
    }
    if (mode === 'period') {
      return factor * (getEarliestPeriodStart(a) - getEarliestPeriodStart(b))
    }
    return 0
  })
}
