import type { CourseData } from '../../../common/types'
import {
  checkChallenge,
  checkCollaboration,
  checkFinmu,
  checkFlexible,
  checkGraduation,
  checkIndependent,
  checkIntegrated,
  checkMentoring,
  checkMooc,
  checkMultiPeriod,
  checkReplacement,
  checkStudyPeriod,
  checkStudyPlace,
  checkStudyYear,
  isActiveFilterState,
} from '../../util/filtering'

export type LocalFilterStateKey =
  | 'replacement'
  | 'mentoring'
  | 'finmu'
  | 'challenge'
  | 'graduation'
  | 'integrated'
  | 'independent'
  | 'studyPlace'
  | 'studyYear'
  | 'studyPeriod'
  | 'mooc'
  | 'collaboration'
  | 'multiPeriod'
  | 'flexible'

/**
 * Maps filter sidebar ids to the corresponding key in FiltersGroupedType.
 * Only contains the ids handled by filterCourseDatas (local/client-side filters).
 */
export const localFilterStateKeys: Record<string, LocalFilterStateKey> = {
  replacement: 'replacement',
  mentoring: 'mentoring',
  finmu: 'finmu',
  challenge: 'challenge',
  graduation: 'graduation',
  integrated: 'integrated',
  independent: 'independent',
  'study-place': 'studyPlace',
  'study-year': 'studyYear',
  'study-period': 'studyPeriod',
  mooc: 'mooc',
  collaboration: 'collaboration',
  'multi-period': 'multiPeriod',
  flexible: 'flexible',
}

export type FilterStateType = {
  primaryLanguage: string
  setPrimaryLanguage: (s: string) => void
  language: string
  setLanguage: (s: string) => void
  primaryLanguageSpecification: string
  setPrimaryLanguageSpecification: (s: string) => void
  studyField: string
  setStudyField: (s: string) => void
  previouslyDoneLang: string
  setPreviouslyDoneLang: (s: string) => void
  replacement: string
  setReplacement: (s: string) => void
  mentoring: string
  setMentoring: (s: string) => void
  finmu: string
  setFinmu: (s: string) => void
  challenge: string
  setChallenge: (s: string) => void
  graduation: string
  setGraduation: (s: string) => void
  studyPlace: string[]
  setStudyPlace: (s: string[]) => void
  studyYear: string
  setStudyYear: (s: string) => void
  studyPeriod: string[]
  setStudyPeriod: (s: string[]) => void
  integrated: string
  setIntegrated: (s: string) => void
  independent: string
  setIndependent: (s: string) => void
  mooc: string
  setMooc: (s: string) => void
  collaboration: string
  setCollaboration: (s: string) => void
  multiPeriod: string
  setMultiPeriod: (s: string) => void
  flexible: string
  setFlexible: (s: string) => void
}

export type FilterConfigMapType = {
  state: string | string[]
  setState: (state: string | string[]) => void
}

/**
 * Returns a helper map to easily access the state of the filters and the comparison function of the filter
 * @param filters
 * @returns
 */
export const filterConfigMap = (filters: any) =>
  new Map<string, FilterConfigMapType>([
    //server side filters
    ['study-field-select', { state: filters.studyField, setState: filters.setStudyField }],
    ['primary-language', { state: filters.primaryLanguage, setState: filters.setPrimaryLanguage }],
    [
      'primary-language-specification',
      { state: filters.primaryLanguageSpecification, setState: filters.setPrimaryLanguageSpecification },
    ],
    ['lang', { state: filters.language, setState: filters.setLanguage }],

    //just a info filter
    ['previusly-done-lang', { state: filters.previouslyDoneLang, setState: filters.setPreviouslyDoneLang }],

    //local filters
    ['replacement', { state: filters.replacement, setState: filters.setReplacement }],
    ['mentoring', { state: filters.mentoring, setState: filters.setMentoring }],
    ['finmu', { state: filters.finmu, setState: filters.setFinmu }],
    ['challenge', { state: filters.challenge, setState: filters.setChallenge }],
    ['graduation', { state: filters.graduation, setState: filters.setGraduation }],
    ['integrated', { state: filters.integrated, setState: filters.setIntegrated }],
    ['independent', { state: filters.independent, setState: filters.setIndependent }],
    ['study-place', { state: filters.studyPlace, setState: filters.setStudyPlace }],
    ['study-year', { state: filters.studyYear, setState: filters.setStudyYear }],
    ['study-period', { state: filters.studyPeriod, setState: filters.setStudyPeriod }],
    ['mooc', { state: filters.mooc, setState: filters.setMooc }],
    ['collaboration', { state: filters.collaboration, setState: filters.setCollaboration }],
    ['multi-period', { state: filters.multiPeriod, setState: filters.setMultiPeriod }],
    ['flexible', { state: filters.flexible, setState: filters.setFlexible }],
  ])

const runFilter = (
  result: CourseData[],
  value: string | string[],
  check: (c: CourseData, value: any) => boolean
): CourseData[] => {
  if (isActiveFilterState(value)) {
    return result.filter(c => check(c, value))
  }
  return result
}

/**
 * @param courseData
 * applies local filters to courseData according to the choices
 *
 *
 * @param filters
 */

export const filterCourseDatas = (courseData: CourseData[], filters: FilterStateType) => {
  let result: CourseData[] = Array.from(courseData)

  result = runFilter(result, filters.replacement, checkReplacement)
  result = runFilter(result, filters.mentoring, checkMentoring)
  result = runFilter(result, filters.finmu, checkFinmu)
  result = runFilter(result, filters.challenge, checkChallenge)
  result = runFilter(result, filters.graduation, checkGraduation)
  result = runFilter(result, filters.integrated, checkIntegrated)
  result = runFilter(result, filters.independent, checkIndependent)
  result = runFilter(result, filters.studyPlace, checkStudyPlace)
  result = runFilter(result, filters.studyYear, checkStudyYear)
  result = runFilter(result, filters.studyPeriod, checkStudyPeriod)
  result = runFilter(result, filters.mooc, checkMooc)
  result = runFilter(result, filters.collaboration, checkCollaboration)
  result = runFilter(result, filters.multiPeriod, checkMultiPeriod)
  result = runFilter(result, filters.flexible, checkFlexible)

  return result
}

export const isFilterStateAnswered = (state: unknown): boolean => {
  if (Array.isArray(state)) {
    return state.length > 0
  }

  if (typeof state === 'string') {
    return state !== ''
  }

  return Boolean(state)
}
