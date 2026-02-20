import { describe, expect, it, vi } from 'vitest'

// Mock to prevent database initialization when importing recommender.ts
vi.mock('../../server/util/dbActions.ts', () => ({
  organisationWithGroupIdOf: vi.fn(),
}))

import type { CourseData } from '../../common/types.ts'
import {
  isIndependentCourse,
  localeNameIncludesAny,
  courseIsCollaboration,
  courseSpansMultiplePeriods,
} from '../../server/util/recommender.ts'

import { organisationWithGroupIdOf } from '../../server/util/dbActions.ts'

const mockOrganisationWithGroupIdOf = organisationWithGroupIdOf as any

const createMinimalCourse = (overrides: Partial<CourseData> = {}): CourseData => ({
  id: 'test-course',
  name: { fi: 'Testikurssi' },
  startDate: new Date(2025, 8, 1),
  endDate: new Date(2025, 8, 5),
  period: [],
  customCodeUrns: {},
  courseUnitRealisationTypeUrn: '',
  courseCodes: [],
  groupIds: [],
  unitIds: [],
  credits: [],
  ...overrides,
})

describe('isIndependentCourse', () => {
  it('returns true when course has kks-alm custom code URN', () => {
    const course = createMinimalCourse({
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': [
          'urn:code:custom:hy-university-root-id:kk-apparaatti:kks-alm',
        ],
      },
    })

    expect(isIndependentCourse(course)).toBe(true)
  })

  it('returns true when name includes itsenäinen', () => {
    const course = createMinimalCourse({ 
      name: { fi: 'Itsenäinen opiskelu' } 
    })

    expect(isIndependentCourse(course)).toBe(true)
  })

  it('returns true when name includes itsenäinen in any case variation', () => {
    const course = createMinimalCourse({ 
      name: { fi: 'ITSENÄINEN Project Work' } 
    })

    expect(isIndependentCourse(course)).toBe(true)
  })

  it('returns false when neither kks-alm code nor itsenäinen name present', () => {
    const course = createMinimalCourse({
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': [
          'urn:code:custom:hy-university-root-id:kk-apparaatti:kks-mat',
        ],
      },
      name: { fi: 'Regular course' },
    })

    expect(isIndependentCourse(course)).toBe(false)
  })
})

describe('localeNameIncludesAny', () => {
  it('matches pattern in fi locale', () => {
    expect(localeNameIncludesAny({ fi: 'Testikurssi' }, ['test'])).toBe(true)
  })

  it('matches pattern in en locale', () => {
    expect(localeNameIncludesAny({ en: 'Test Course' }, ['test'])).toBe(true)
  })

  it('matches pattern in sv locale', () => {
    expect(localeNameIncludesAny({ sv: 'Testkurs' }, ['test'])).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(localeNameIncludesAny({ fi: 'TESTIKURSSI' }, ['test'])).toBe(true)
  })

  it('matches multiple patterns', () => {
    expect(
      localeNameIncludesAny({ fi: 'Matematiikka-kurssi' }, ['mathemat', 'matema'])
    ).toBe(true)
  })

  it('returns false when no pattern matches', () => {
    expect(
      localeNameIncludesAny(
        { fi: 'Kurssi', en: 'Course', sv: 'Kurs' },
        ['xyz', 'abc']
      )
    ).toBe(false)
  })

  it('handles undefined localizedName', () => {
    expect(localeNameIncludesAny(undefined, ['test'])).toBe(false)
  })

  it('handles missing locale fields', () => {
    expect(localeNameIncludesAny({ fi: 'Test' }, ['course'])).toBe(false)
  })
})

describe('courseIsCollaboration', () => {
  it('returns true when course name includes collaboration pattern', async () => {
    mockOrganisationWithGroupIdOf.mockResolvedValue([])
    const course = createMinimalCourse({
      name: { fi: 'Työväen akatemia kurssi' },
    })

    expect(await courseIsCollaboration(course)).toBe(true)
  })

  it('returns true when organisation name includes collaboration pattern', async () => {
    mockOrganisationWithGroupIdOf.mockResolvedValue([
      { name: { fi: 'Vaasa kampus' } } as any,
    ])
    const course = createMinimalCourse({ groupIds: ['g1'] })

    expect(await courseIsCollaboration(course)).toBe(true)
  })

  it('returns false when neither course nor organisation name match collaboration patterns', async () => {
    mockOrganisationWithGroupIdOf.mockResolvedValue([
      { name: { fi: 'Regular org' } } as any,
    ])
    const course = createMinimalCourse({ name: { fi: 'Regular course' } })

    expect(await courseIsCollaboration(course)).toBe(false)
  })

  it('returns false when no groupIds provided and name does not match', async () => {
    const course = createMinimalCourse({ 
      name: { fi: 'Regular course' },
      groupIds: [],
    })

    expect(await courseIsCollaboration(course)).toBe(false)
  })
})

describe('courseSpansMultiplePeriods', () => {
  it('returns true when course has multiple periods', () => {
    const course = createMinimalCourse({
      period: [
        {
          name: 'autumn-2025',
          startDate: new Date(2025, 8, 1),
          endDate: new Date(2025, 11, 31),
          startYear: '2025',
          endYear: '2025',
        },
        {
          name: 'spring-2026',
          startDate: new Date(2026, 0, 1),
          endDate: new Date(2026, 4, 31),
          startYear: '2026',
          endYear: '2026',
        },
      ],
    })

    expect(courseSpansMultiplePeriods(course)).toBe(true)
  })

  it('returns false when course has exactly one period', () => {
    const course = createMinimalCourse({
      period: [
        {
          name: 'autumn-2025',
          startDate: new Date(2025, 8, 1),
          endDate: new Date(2025, 11, 31),
          startYear: '2025',
          endYear: '2025',
        },
      ],
    })

    expect(courseSpansMultiplePeriods(course)).toBe(false)
  })

  it('returns false when course has no periods', () => {
    const course = createMinimalCourse({ period: [] })
    expect(courseSpansMultiplePeriods(course)).toBe(false)
  })

  it('returns false when period is null', () => {
    const course = createMinimalCourse({ period: null as any })
    expect(courseSpansMultiplePeriods(course)).toBe(false)
  })
})

