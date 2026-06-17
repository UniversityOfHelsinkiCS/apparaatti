import type { CourseData, Period } from '../../common/types'

const collaborationNamePatterns = ['työväen akatemia', 'laajasalon opisto']

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
  const result = hasApparaattiCodeUrn(course, 'kks-pre')
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
  const periods = course.period
  if (!periods) {
    return false // should not happen
  }

  return periods.some(p => p.startYear === studyYear)
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

//It is now considered spec that since the question for this gives the impression of a course
//taking a long time the filter should try to show courses that are > n weeks
export const checkMultiPeriod = (course: CourseData, value: string) => {
  const diffWeeks = Math.abs((course.endDate.getTime() - course.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
  // period is 7 weeks but looking for > 8
  // since some single period courses last a little bit to the next period
  const result = diffWeeks > 8
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
