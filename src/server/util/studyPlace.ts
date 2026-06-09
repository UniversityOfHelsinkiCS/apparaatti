import type { AnswerData, CourseData } from '../../common/types.ts'
import { courseHasAnyRealisationCodeUrn, courseHasCustomCodeUrn } from './organisationCourseRecommmendations.ts'
import { correctValue, incorrectValue, resolveStudyPlaceLookups, studyPlaceAliasToCanonicalIds } from './constants.ts'

export function readArrOrSingleValue(val: string | string[]) {
  const value = val ? val : []
  if (Array.isArray(value)) {
    return value
  } else {
    return [value]
  }
}

export function readStudyPlaceCoordinate(_answerData: AnswerData) {
  //reason for this is that by default we want to filter out exam courses,
  //this makes it look like the user has always answered to this question
  return correctValue
}

export function courseStudyPlaceCoordinate(course: CourseData, answerData: AnswerData) {
  const userStudyPlaces = readArrOrSingleValue(answerData['study-place'])
  const hasStudyPlaceSelection = userStudyPlaces.length > 0 && !userStudyPlaces.includes('neutral')
  const examSelected = userStudyPlaces.includes('exam')
  const independentSelected = userStudyPlaces.includes('independent')

  if (isExam(course)) {
    return examSelected ? correctValue : incorrectValue
  }

  if (!hasStudyPlaceSelection) {
    return correctValue
  }

  if (isIndependentCourse(course)) {
    if (independentSelected) {
      return correctValue
    }
  }

  const lookups = resolveStudyPlaceLookups(userStudyPlaces)

  if (courseHasAnyRealisationCodeUrn(course, lookups)) {
    return correctValue
  }
  return incorrectValue
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
  const hasIndependentCodeUrn = courseHasCustomCodeUrn(course, 'kks-alm')
  const hasIndependentInName = course.name.fi?.toLowerCase().includes('itsenäinen')

  return hasIndependentCodeUrn || hasIndependentInName
}

export function isExam(course: CourseData) {
  return course.name.fi?.toLowerCase().includes('tentti') ?? false
}
