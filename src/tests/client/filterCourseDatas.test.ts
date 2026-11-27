import { describe, expect, it } from 'vitest'

import { filterCourseDatas, FilterStateType } from '../../client/contexts/filter/filterState'
import type { CourseData, Period } from '../../common/types.ts'

const createCustomCodeUrns = (...codes: string[]) => ({
  'urn:code:custom:hy-university-root-id:kk-apparaatti': codes.map(
    code => `urn:code:custom:hy-university-root-id:kk-apparaatti:${code}`
  ),
})

const createPeriod = (name: string, startYear = '2025'): Period => ({
  name,
  startDate: new Date(2025, 7, 1),
  endDate: new Date(2025, 7, 31),
  startYear,
  endYear: startYear,
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
      title: 'finmu excludes replacement courses',
      filters: createLocalFilters({ finmu: '1' }),
      matchingCourse: createCourse({ id: 'match', courseCodes: ['KK-FINMU'] }),
      otherCourse: createCourse({
        id: 'other',
        courseCodes: ['KK-FINMU'],
        customCodeUrns: createCustomCodeUrns('kks-kor'),
      }),
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
      matchingCourse: createCourse({ id: 'match', period: [createPeriod('period_1', '2025')] }),
      otherCourse: createCourse({ id: 'other', period: [createPeriod('period_1', '2026')] }),
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
      matchingCourse: createCourse({
        id: 'match',
        startDate: new Date(2025, 7, 1),
        endDate: new Date(2025, 10, 1),
      }),
      otherCourse: createCourse({ id: 'other' }),
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

describe('filterCourseDatas with a no answer', () => {
  it.each([
    {
      title: 'replacement',
      filters: createLocalFilters({ replacement: '0' }),
      carrier: createCourse({ id: 'carrier', customCodeUrns: createCustomCodeUrns('kks-kor') }),
      plain: createCourse({ id: 'plain' }),
    },
    {
      title: 'mentoring',
      filters: createLocalFilters({ mentoring: '0' }),
      carrier: createCourse({ id: 'carrier', customCodeUrns: createCustomCodeUrns('kks-pre') }),
      plain: createCourse({ id: 'plain' }),
    },
    {
      title: 'finmu',
      filters: createLocalFilters({ finmu: '0' }),
      carrier: createCourse({ id: 'carrier', courseCodes: ['KK-FINMU'] }),
      plain: createCourse({ id: 'plain', courseCodes: ['KK-FIN01'] }),
    },
    {
      title: 'challenge',
      filters: createLocalFilters({ challenge: '0' }),
      carrier: createCourse({ id: 'carrier', customCodeUrns: createCustomCodeUrns('kks-muk') }),
      plain: createCourse({ id: 'plain' }),
    },
    {
      title: 'graduation',
      filters: createLocalFilters({ graduation: '0' }),
      carrier: createCourse({ id: 'carrier', customCodeUrns: createCustomCodeUrns('kks-val') }),
      plain: createCourse({ id: 'plain' }),
    },
    {
      title: 'integrated',
      filters: createLocalFilters({ integrated: '0' }),
      carrier: createCourse({ id: 'carrier', customCodeUrns: createCustomCodeUrns('kks-int') }),
      plain: createCourse({ id: 'plain' }),
    },
    {
      title: 'independent',
      filters: createLocalFilters({ independent: '0' }),
      carrier: createCourse({
        id: 'carrier',
        courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-independent',
      }),
      plain: createCourse({
        id: 'plain',
        courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-online',
      }),
    },
    {
      title: 'mooc',
      filters: createLocalFilters({ mooc: '0' }),
      carrier: createCourse({ id: 'carrier', customCodeUrns: createCustomCodeUrns('opintotarjonta:mooc') }),
      plain: createCourse({ id: 'plain' }),
    },
    {
      title: 'collaboration',
      filters: createLocalFilters({ collaboration: '0' }),
      carrier: createCourse({ id: 'carrier', name: { fi: 'Työväen akatemia kurssi' } }),
      plain: createCourse({ id: 'plain', name: { fi: 'Tavallinen kurssi' } }),
    },
    {
      title: 'multiPeriod',
      filters: createLocalFilters({ multiPeriod: '0' }),
      carrier: createCourse({ id: 'carrier', startDate: new Date(2025, 7, 1), endDate: new Date(2025, 10, 1) }),
      plain: createCourse({ id: 'plain' }),
    },
    {
      title: 'flexible',
      filters: createLocalFilters({ flexible: '0' }),
      carrier: createCourse({ id: 'carrier', customCodeUrns: createCustomCodeUrns('kks-jou') }),
      plain: createCourse({ id: 'plain' }),
    },
  ])('the $title filter keeps exactly the courses a yes answer would drop', ({ filters, carrier, plain }) => {
    const filtered = filterCourseDatas([carrier, plain], filters)

    expect(filtered.map(course => course.id)).toEqual(['plain'])
  })
})

describe('filterCourseDatas with several filters at once', () => {
  it('narrows to the courses matching every yes answer', () => {
    const both = createCourse({ id: 'both', customCodeUrns: createCustomCodeUrns('kks-kor', 'opintotarjonta:mooc') })
    const onlyReplacement = createCourse({ id: 'only-replacement', customCodeUrns: createCustomCodeUrns('kks-kor') })
    const onlyMooc = createCourse({ id: 'only-mooc', customCodeUrns: createCustomCodeUrns('opintotarjonta:mooc') })

    const filtered = filterCourseDatas(
      [both, onlyReplacement, onlyMooc],
      createLocalFilters({ replacement: '1', mooc: '1' })
    )

    expect(filtered.map(course => course.id)).toEqual(['both'])
  })

  it('combines a yes answer with a no answer', () => {
    const wanted = createCourse({ id: 'wanted', customCodeUrns: createCustomCodeUrns('kks-kor') })
    const alsoMentoring = createCourse({
      id: 'also-mentoring',
      customCodeUrns: createCustomCodeUrns('kks-kor', 'kks-pre'),
    })
    const neither = createCourse({ id: 'neither' })

    const filtered = filterCourseDatas(
      [wanted, alsoMentoring, neither],
      createLocalFilters({ replacement: '1', mentoring: '0' })
    )

    expect(filtered.map(course => course.id)).toEqual(['wanted'])
  })

  it('leaves every course alone when no filter is answered', () => {
    const first = createCourse({ id: 'first', customCodeUrns: createCustomCodeUrns('kks-kor') })
    const second = createCourse({ id: 'second' })

    const filtered = filterCourseDatas([first, second], createLocalFilters())

    expect(filtered.map(course => course.id)).toEqual(['first', 'second'])
  })
})
