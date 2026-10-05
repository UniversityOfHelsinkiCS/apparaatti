import type { UrnMatchMode } from '../../../common/types.ts'
import type { CoursesSearchFieldsValues, ReviewStatusFilterValue } from './CoursesSearchFields.tsx'

export interface CourseSearchValues {
  nameSearch: string
  urnSearch: string[]
  urnMode: UrnMatchMode
  courseCodeSearch: string
  excludeUrnsSearch: string[]
  excludeUrnsMode: UrnMatchMode
  excludeCourseCodesSearch: string
  reviewStatusSearch: ReviewStatusFilterValue
  dateFromSearch: string
  dateToSearch: string
}

export const emptyCourseSearchValues: CourseSearchValues = {
  nameSearch: '',
  urnSearch: [],
  urnMode: 'or',
  courseCodeSearch: '',
  excludeUrnsSearch: [],
  excludeUrnsMode: 'or',
  excludeCourseCodesSearch: '',
  reviewStatusSearch: 'all',
  dateFromSearch: '',
  dateToSearch: '',
}

export const courseSearchValuesFromFields = (fields: CoursesSearchFieldsValues): CourseSearchValues => ({
  nameSearch: fields.nameInput,
  urnSearch: fields.urnInputs,
  urnMode: fields.urnMode,
  courseCodeSearch: fields.courseCodeInput,
  excludeUrnsSearch: fields.excludeUrnsInputs,
  excludeUrnsMode: fields.excludeUrnsMode,
  excludeCourseCodesSearch: fields.excludeCourseCodesInput,
  reviewStatusSearch: fields.reviewStatusInput,
  dateFromSearch: fields.dateFromInput,
  dateToSearch: fields.dateToInput,
})

export const courseSearchFilterParams = (values: CourseSearchValues): Record<string, string> => {
  const params: Record<string, string> = {}
  if (values.nameSearch) params.name = values.nameSearch
  if (values.urnSearch.length > 0) {
    params.urn = values.urnSearch.join(',')
    if (values.urnMode !== 'or') params.urnMode = values.urnMode
  }
  if (values.courseCodeSearch) params.courseCode = values.courseCodeSearch
  if (values.excludeUrnsSearch.length > 0) {
    params.excludeUrns = values.excludeUrnsSearch.join(',')
    if (values.excludeUrnsMode !== 'or') params.excludeUrnsMode = values.excludeUrnsMode
  }
  if (values.excludeCourseCodesSearch) params.excludeCourseCodes = values.excludeCourseCodesSearch
  if (values.reviewStatusSearch !== 'all') params.reviewStatus = values.reviewStatusSearch
  if (values.dateFromSearch) params.dateFrom = values.dateFromSearch
  if (values.dateToSearch) params.dateTo = values.dateToSearch
  return params
}

export const buildCourseQueryString = (values: CourseSearchValues, page: number, limit: number): string =>
  new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...courseSearchFilterParams(values),
  }).toString()

export const courseSearchCacheKey = (values: CourseSearchValues, page: number): string =>
  `${page}-${new URLSearchParams(courseSearchFilterParams(values)).toString()}`
