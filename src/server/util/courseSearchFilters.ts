import type { UrnMatchMode } from '../../common/types.ts'
import type { CourseSearchFilters } from './dbActions.ts'

function asUrnMatchMode(value: unknown): UrnMatchMode {
  return value === 'and' ? 'and' : 'or'
}

export function courseSearchFiltersFromQuery(query: Record<string, unknown>): CourseSearchFilters {
  return {
    nameSearch: query.name as string | undefined,
    urnSearch: query.urn as string | undefined,
    urnMode: asUrnMatchMode(query.urnMode),
    excludeUrns: query.excludeUrns as string | undefined,
    excludeUrnsMode: asUrnMatchMode(query.excludeUrnsMode),
    courseCodeSearch: query.courseCode as string | undefined,
    excludeCourseCodes: query.excludeCourseCodes as string | undefined,
    reviewStatus: query.reviewStatus as string | undefined,
    dateFrom: query.dateFrom as string | undefined,
    dateTo: query.dateTo as string | undefined,
  }
}
