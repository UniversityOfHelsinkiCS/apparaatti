import type { CourseData, Period } from '../../common/types'

const collaborationNamePatterns = ['työväen akatemia', 'laajasalon opisto']
const mentoringCourseCodes = [
  'KK-ENG301',
  'KK-ENG302',
  'KK-ENG303',
  'KK-RUO204',
  'KK-RUO205',
  'KK-RUO206',
  'KK-FIN01',
  'KK-FIN02',
  'KK-FIN08',
]

export const hasApparaattiCodeUrn = (course: CourseData, codeUrn: string) => {
  return Object.entries(course.customCodeUrns ?? {}).some(([key, values]) => {
    return key.includes('kk-apparaatti') && values.some(value => value.includes(codeUrn))
  })
}

export const hasAnyCourseCode = (course: CourseData, codes: string[]) => {
  return codes.some(code => course.courseCodes.includes(code))
}

export const hasAnyNamePattern = (course: CourseData, patterns: string[]) => {
  const localizedNames = [course.name.fi, course.name.en, course.name.sv]
    .filter(Boolean)
    .map(name => name!.toLowerCase())

  return patterns.some(pattern => localizedNames.some(name => name.includes(pattern)))
}

export const checkReplacement = (course: CourseData, value: string) => {
  const result = hasApparaattiCodeUrn(course, 'kks-kor')
  return value != '0' ? result : !result
}

export const checkMentoring = (course: CourseData, value: string) => {
  const result = hasAnyCourseCode(course, mentoringCourseCodes)
  return value != '0' ? result : !result
}

export const checkFinmu = (course: CourseData, value: string) => {
  const result = hasAnyCourseCode(course, ['KK-FINMU'])
  return value != '0' ? result : !result
}

export const checkChallenge = (course: CourseData, value: string) => {
  const result = course.courseCodes.some(code => code.includes('ERI')) || hasApparaattiCodeUrn(course, 'kks-kor')
  return value != '0' ? result : !result
}

export const checkGraduation = (course: CourseData, value: string) => {
  const result = hasApparaattiCodeUrn(course, 'kks-val') || hasApparaattiCodeUrn(course, 'kkt-val')
  return value != '0' ? result : !result
}

export const checkIntegrated = (course: CourseData, value: string) => {
  const result = hasApparaattiCodeUrn(course, 'kks-int')
  return value != '0' ? result : !result
}

export const checkIndependent = (course: CourseData, value: string) => {
  const result =
    hasApparaattiCodeUrn(course, 'kks-alm') || (course.name.fi?.toLowerCase().includes('itsenäinen') ?? false)
  return value != '0' ? result : !result
}

export const checkStudyPlace = (course: CourseData, studyPlace: string[]) => {
  return studyPlace.includes(course.normalizedStudyPlace ?? '')
}

export const checkStudyYear = (course: CourseData, studyYear: string) => {
  return course.startDate.getFullYear().toString() === studyYear
}

export const checkStudyPeriod = (course: CourseData, studyPeriod: string[]) => {
  return (course.period ?? []).some((period: Period) => studyPeriod.includes(period.name))
}

export const checkMooc = (course: CourseData, value: string) => {
  const result = hasApparaattiCodeUrn(course, 'opintotarjonta:mooc')

  return value != '0' ? result : !result
}

export const checkCollaboration = (course: CourseData, value: string) => {
  const result = hasAnyNamePattern(course, collaborationNamePatterns)
  return value != '0' ? result : !result
}

export const checkMultiPeriod = (course: CourseData, value: string) => {
  const result = (course.period?.length ?? 0) > 1
  return value != '0' ? result : !result
}

export const checkFlexible = (course: CourseData, value: string) => {
  const result = hasApparaattiCodeUrn(course, 'kks-jou')
  return value != '0' ? result : !result
}

export const isActiveFilterState = (state: string | string[]) => {
  if (Array.isArray(state)) {
    return state.length > 0 && !state.includes('neutral')
  }

  return state !== '' && state !== 'neutral'
}
