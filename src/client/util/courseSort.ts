import type { CourseRecommendation } from '../../common/types'
import { translateLocalizedString } from './i18n'
import type { SortDirection, SortMode } from '../components/CourseSortControls'

export const getEarliestPeriodStart = (c: CourseRecommendation): number => {
  if (!c.course.period || c.course.period.length === 0) {
    return new Date(c.course.startDate).getTime()
  }
  return Math.min(...c.course.period.map(p => new Date(p.startDate).getTime()))
}

export const sortCourses = (courses: CourseRecommendation[], mode: SortMode, direction: SortDirection = 'asc'): CourseRecommendation[] => {
  if (mode === 'recommended') return courses
  const factor = direction === 'asc' ? 1 : -1
  return [...courses].sort((a, b) => {
    if (mode === 'name') {
      return factor * translateLocalizedString(a.course.name).localeCompare(translateLocalizedString(b.course.name))
    }
    if (mode === 'period') {
      return factor * (getEarliestPeriodStart(a) - getEarliestPeriodStart(b))
    }
    return 0
  })
}
