import { describe, expect, it } from 'vitest'

import { filterCourseDatas, FilterStateType } from '../../client/contexts/filterContext.tsx'
import type { CourseData, Period } from '../../common/types.ts'

const createCustomCodeUrns = (...codes: string[]) => ({
  'urn:code:custom:hy-university-root-id:kk-apparaatti': codes.map(
    code => `urn:code:custom:hy-university-root-id:kk-apparaatti:${code}`
  ),
})

const createPeriod = (name: string): Period => ({
  name,
  startDate: new Date(2025, 7, 1),
  endDate: new Date(2025, 7, 31),
  startYear: '2025',
  endYear: '2025',
})

const createCourse = (overrides: Partial<CourseData> = {}): CourseData => ({
  id: 'course-1',
  name: { fi: 'Test course' },
  startDate: new Date(2025, 7, 1),
  endDate: new Date(2025, 7, 31),
  period: [createPeriod('period_1')],
  customCodeUrns: {},
  courseUnitRealisationTypeUrn: '',
  normalizedStudyPlace: '',
  courseCodes: [],
  groupIds: [],
  unitIds: [],
  credits: [],
  flowState: null,
  ...overrides,
})

const createLocalFilters = (overrides: Record<string, unknown> = {}) =>
  ({
    studyPlace: [],
    independent: '',
    multiPeriod: '',
    flexible: '',
    mooc: '',
    collaboration: '',
    previouslyDoneLang: '',
    replacement: '',
    mentoring: '',
    finmu: '',
    challenge: '',
    graduation: '',
    integrated: '',
    studyYear: '',
    studyPeriod: [],
    ...overrides,
  }) as unknown as FilterStateType

describe('filterCourseDatas', () => {
  it.each([
    {
      title: 'previouslyDoneLang',
      filters: createLocalFilters({ previouslyDoneLang: '1' }),
      matchingCourse: createCourse({ id: 'match' }),
      otherCourse: createCourse({ id: 'other', name: { fi: 'Other course' } }),
      expectedIds: ['match', 'other'],
    },
    {
      title: 'replacement',
      filters: createLocalFilters({ replacement: '1' }),
      matchingCourse: createCourse({ id: 'match', customCodeUrns: createCustomCodeUrns('kks-kor') }),
      otherCourse: createCourse({ id: 'other' }),
      expectedIds: ['match'],
    },
    {
      title: 'mentoring',
      filters: createLocalFilters({ mentoring: '1' }),
      matchingCourse: createCourse({ id: 'match', customCodeUrns: createCustomCodeUrns('kks-pre') }),
      otherCourse: createCourse({ id: 'other' }),
      expectedIds: ['match'],
    },
    {
      title: 'finmu',
      filters: createLocalFilters({ finmu: '1' }),
      matchingCourse: createCourse({ id: 'match', courseCodes: ['KK-FINMU'] }),
      otherCourse: createCourse({ id: 'other', courseCodes: ['KK-FIN01'] }),
      expectedIds: ['match'],
    },
    {
      title: 'challenge',
      filters: createLocalFilters({ challenge: '1' }),
      matchingCourse: createCourse({ id: 'match', customCodeUrns: createCustomCodeUrns('kks-muk') }),
      otherCourse: createCourse({ id: 'other' }),
      expectedIds: ['match'],
    },
    {
      title: 'graduation',
      filters: createLocalFilters({ graduation: '1' }),
      matchingCourse: createCourse({ id: 'match', customCodeUrns: createCustomCodeUrns('kks-val') }),
      otherCourse: createCourse({ id: 'other' }),
      expectedIds: ['match'],
    },
    {
      title: 'integrated',
      filters: createLocalFilters({ integrated: '1' }),
      matchingCourse: createCourse({ id: 'match', customCodeUrns: createCustomCodeUrns('kks-int') }),
      otherCourse: createCourse({ id: 'other' }),
      expectedIds: ['match'],
    },
    {
      title: 'independent',
      filters: createLocalFilters({ independent: '1' }),
      matchingCourse: createCourse({
        id: 'match',
        courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-independent',
      }),
      otherCourse: createCourse({
        id: 'other',
        courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-online',
      }),
      expectedIds: ['match'],
    },
    {
      title: 'studyPlace',
      filters: createLocalFilters({ studyPlace: ['online'] }),
      matchingCourse: createCourse({ id: 'match', normalizedStudyPlace: 'online' }),
      otherCourse: createCourse({ id: 'other', normalizedStudyPlace: 'contact' }),
      expectedIds: ['match'],
    },
    {
      title: 'studyYear',
      filters: createLocalFilters({ studyYear: '2025' }),
      matchingCourse: createCourse({ id: 'match', startDate: new Date(2025, 7, 1) }),
      otherCourse: createCourse({ id: 'other', startDate: new Date(2026, 7, 1) }),
      expectedIds: ['match'],
    },
    {
      title: 'studyPeriod',
      filters: createLocalFilters({ studyPeriod: ['period_2'] }),
      matchingCourse: createCourse({ id: 'match', period: [createPeriod('period_2')] }),
      otherCourse: createCourse({ id: 'other', period: [createPeriod('period_1')] }),
      expectedIds: ['match'],
    },
    {
      title: 'mooc',
      filters: createLocalFilters({ mooc: '1' }),
      matchingCourse: createCourse({ id: 'match', customCodeUrns: createCustomCodeUrns('opintotarjonta:mooc') }),
      otherCourse: createCourse({ id: 'other' }),
      expectedIds: ['match'],
    },
    {
      title: 'collaboration',
      filters: createLocalFilters({ collaboration: '1' }),
      matchingCourse: createCourse({ id: 'match', name: { fi: 'Työväen akatemia kurssi' } }),
      otherCourse: createCourse({ id: 'other', name: { fi: 'Tavallinen kurssi' } }),
      expectedIds: ['match'],
    },
    {
      title: 'multiPeriod',
      filters: createLocalFilters({ multiPeriod: '1' }),
      matchingCourse: createCourse({ id: 'match', period: [createPeriod('period_1'), createPeriod('period_2')] }),
      otherCourse: createCourse({ id: 'other', period: [createPeriod('period_1')] }),
      expectedIds: ['match'],
    },
    {
      title: 'flexible',
      filters: createLocalFilters({ flexible: '1' }),
      matchingCourse: createCourse({ id: 'match', customCodeUrns: createCustomCodeUrns('kks-jou') }),
      otherCourse: createCourse({ id: 'other' }),
      expectedIds: ['match'],
    },
  ])('applies the $title local filter', ({ filters, matchingCourse, otherCourse, expectedIds }) => {
    const filtered = filterCourseDatas([matchingCourse, otherCourse], filters)

    expect(filtered.map(course => course.id)).toEqual(expectedIds)
  })
})
