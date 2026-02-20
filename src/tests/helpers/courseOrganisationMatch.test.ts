import { describe, expect, it, vi } from 'vitest'

// Mock to prevent database initialization when importing recommender.ts
vi.mock('../../server/util/dbActions.ts', () => ({
  organisationWithGroupIdOf: vi.fn(),
}))

import type { CourseData } from '../../common/types.ts'
import {
  courseIsSpesificForUserOrg,
  courseInSameOrganisationAsUser,
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

describe('courseIsSpesificForUserOrg', () => {
  it('returns true when course has custom code URN for the user org (H40 -> kkt-hum)', () => {
    const course = createMinimalCourse({
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': [
          'urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-hum',
        ],
      },
    })

    expect(courseIsSpesificForUserOrg(course, 'H40')).toBe(true)
  })

  it('returns false when org code has no URN mapping (unknown org)', () => {
    const course = createMinimalCourse({
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': [
          'urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-hum',
        ],
      },
    })

    expect(courseIsSpesificForUserOrg(course, 'UNKNOWN')).toBe(false)
  })

  it('returns false when course does not have custom code for user org', () => {
    const course = createMinimalCourse({
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': [
          'urn:code:custom:hy-university-root-id:kk-apparaatti:kks-mat',
        ],
      },
    })

    expect(courseIsSpesificForUserOrg(course, 'H40')).toBe(false)
  })

  it('returns false when course has no custom codes at all', () => {
    const course = createMinimalCourse({
      customCodeUrns: {},
    })

    expect(courseIsSpesificForUserOrg(course, 'H40')).toBe(false)
  })
})

describe('courseInSameOrganisationAsUser', () => {
  it('returns true when course has custom code URN for users org', async () => {
    const course = createMinimalCourse({
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': [
          'urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-hum',
        ],
      },
    })

    expect(await courseInSameOrganisationAsUser(course, 'H40', [])).toBe(true)
  })

  it('BUG DETECTION: should return true when user org matches course via organisation groupIds (currently fails due to in operator bug)', async () => {
    // This test FAILS if the bug exists (demonstrating the bug is present)
    // This test PASSES when the bug is fixed (when code changes from `in` to `.includes()`)
    mockOrganisationWithGroupIdOf.mockResolvedValue([{ code: 'H40' } as any])
    const course = createMinimalCourse({ groupIds: ['group1'] })

    // EXPECTED: should return true because organisation with code 'H40' is associated with the course
    // ACTUAL: returns false due to `'H40' in ['H40']` checking array properties instead of values
    // FIX: Change line 94 in recommender.ts from `if( organisationCode in orgCodes)` 
    // to `if(orgCodes.includes(organisationCode))`
    expect(await courseInSameOrganisationAsUser(course, 'H40', [])).toBe(true)
  })

  it('returns true when course codes match the provided org codes list', async () => {
    mockOrganisationWithGroupIdOf.mockResolvedValue([])
    const course = createMinimalCourse({
      courseCodes: ['H40-INTRO-2025', 'H40-MAIN-001'],
    })

    expect(await courseInSameOrganisationAsUser(course, 'H40', ['H40-INTRO-2025'])).toBe(true)
  })

  it('returns false when all checks fail (no custom codes, no org match, no course code match)', async () => {
    mockOrganisationWithGroupIdOf.mockResolvedValue([])
    const course = createMinimalCourse({
      customCodeUrns: {},
      courseCodes: ['OTHER-CODE'],
    })

    expect(await courseInSameOrganisationAsUser(course, 'H40', ['H40-INTRO-2025'])).toBe(false)
  })

  it('returns false when course codes do not match org code list', async () => {
    mockOrganisationWithGroupIdOf.mockResolvedValue([])
    const course = createMinimalCourse({
      customCodeUrns: {},
      courseCodes: ['OTHER-CODE', 'ANOTHER-CODE'],
    })

    expect(await courseInSameOrganisationAsUser(course, 'H40', ['H40-INTRO-2025'])).toBe(false)
  })

  it('returns true when org codes list is empty but custom code matches', async () => {
    const course = createMinimalCourse({
      customCodeUrns: {
        'urn:code:custom:hy-university-root-id:kk-apparaatti': [
          'urn:code:custom:hy-university-root-id:kk-apparaatti:kkt-hum',
        ],
      },
    })

    expect(await courseInSameOrganisationAsUser(course, 'H40', [])).toBe(true)
  })
})
