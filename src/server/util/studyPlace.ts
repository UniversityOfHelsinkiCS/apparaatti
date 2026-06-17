import type { CourseData } from '../../common/types.ts'
import { studyPlaceAliasToCanonicalIds } from './constants.ts'

export function readArrOrSingleValue(val: string | string[]) {
  const value = val ? val : []
  if (Array.isArray(value)) {
    return value
  } else {
    return [value]
  }
}

export function getNormalizedStudyPlace(course: CourseData) {
  if (isExam(course)) {
    return 'exam'
  }

  if (isIndependentCourse(course)) {
    return 'independent'
  }

  const normalizedStudyPlace = Object.entries(studyPlaceAliasToCanonicalIds).find(([, realisationTypes]) =>
    realisationTypes.some(realisationType => course.courseUnitRealisationTypeUrn.includes(realisationType))
  )?.[0]

  if (normalizedStudyPlace) {
    return normalizedStudyPlace
  }

  return ''
}

export function isIndependentCourse(course: CourseData) {
  return course.courseUnitRealisationTypeUrn?.includes('independent') ?? false
}

export function isExam(course: CourseData) {
  return course.name.fi?.toLowerCase().includes('tentti') ?? false
}
