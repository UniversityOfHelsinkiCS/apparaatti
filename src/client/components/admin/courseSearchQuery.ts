import type { UrnMatchMode } from '../../../common/types.ts'
import type { CoursesSearchFieldsValues, ReviewStatusFilterValue } from './CoursesSearchFields.tsx'

export interface CourseSearchValues {
  nameSearch: string
  urnSearch: string[]
  urnMode: UrnMatchMode
  courseCodeSearch: string
  excludeUrnsSearch: string[]
  excludeUrnsMode: UrnMatchMode
  tagSearch: string[]
  tagMode: UrnMatchMode
  excludeTagsSearch: string[]
  excludeTagsMode: UrnMatchMode
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
  tagSearch: [],
  tagMode: 'or',
  excludeTagsSearch: [],
  excludeTagsMode: 'or',
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
  tagSearch: fields.tagInputs,
  tagMode: fields.tagMode,
  excludeTagsSearch: fields.excludeTagsInputs,
  excludeTagsMode: fields.excludeTagsMode,
  excludeCourseCodesSearch: fields.excludeCourseCodesInput,
  reviewStatusSearch: fields.reviewStatusInput,
  dateFromSearch: fields.dateFromInput,
  dateToSearch: fields.dateToInput,
})

export const courseSearchFilterParams = (values: CourseSearchValues): Record<string, string> => {
  const {
    nameSearch,
    urnSearch,
    urnMode,
    courseCodeSearch,
    excludeUrnsSearch,
    excludeUrnsMode,
    tagSearch,
    tagMode,
    excludeTagsSearch,
    excludeTagsMode,
    excludeCourseCodesSearch,
    reviewStatusSearch,
    dateFromSearch,
    dateToSearch,
  } = values

  const params: Record<string, string> = {}

  if (nameSearch) {
    params.name = nameSearch
  }

  if (urnSearch.length > 0) {
    params.urn = urnSearch.join(',')

    if (urnMode !== 'or') {
      params.urnMode = urnMode
    }
  }

  if (courseCodeSearch) {
    params.courseCode = courseCodeSearch
  }

  if (excludeUrnsSearch.length > 0) {
    params.excludeUrns = excludeUrnsSearch.join(',')

    if (excludeUrnsMode !== 'or') {
      params.excludeUrnsMode = excludeUrnsMode
    }
  }

  if (tagSearch.length > 0) {
    params.tags = tagSearch.join(',')

    if (tagMode !== 'or') {
      params.tagsMode = tagMode
    }
  }

  if (excludeTagsSearch.length > 0) {
    params.excludeTags = excludeTagsSearch.join(',')

    if (excludeTagsMode !== 'or') {
      params.excludeTagsMode = excludeTagsMode
    }
  }

  if (excludeCourseCodesSearch) {
    params.excludeCourseCodes = excludeCourseCodesSearch
  }

  if (reviewStatusSearch !== 'all') {
    params.reviewStatus = reviewStatusSearch
  }

  if (dateFromSearch) {
    params.dateFrom = dateFromSearch
  }

  if (dateToSearch) {
    params.dateTo = dateToSearch
  }

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
