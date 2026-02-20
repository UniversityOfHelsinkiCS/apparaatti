import { describe, expect, it, vi } from 'vitest'

// Mock to prevent database initialization when importing recommender.ts
vi.mock('../../server/util/dbActions.ts', () => ({
  organisationWithGroupIdOf: vi.fn(),
}))

import type { AnswerData, CourseData } from '../../common/types.ts'
import {
  readStudyPlaceCoordinate,
  courseStudyPlaceCoordinate,
} from '../../server/util/recommender.ts'
import {
  correctValue,
  notAnsweredValue,
  incorrectValue,
} from '../../server/util/constants.ts'

const createAnswerData = (overrides: Partial<AnswerData> = {}): AnswerData => ({
  'study-year': 'neutral',
  'study-period': 'neutral',
  'graduation': 'neutral',
  'mentoring': 'neutral',
  'integrated': 'neutral',
  'study-place': 'neutral',
  'replacement': 'neutral',
  'challenge': 'neutral',
  'independent': 'neutral',
  'flexible': 'neutral',
  'mooc': 'neutral',
  'study-field-select': 'neutral',
  'lang': 'neutral',
  'primary-language': 'neutral',
  'primary-language-specification': 'neutral',
  'multi-period': 'neutral',
  ...overrides,
})

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

describe('readStudyPlaceCoordinate', () => {
  it('returns notAnsweredValue for neutral', () => {
    const data = createAnswerData({ 'study-place': 'neutral' })
    expect(readStudyPlaceCoordinate(data)).toBe(notAnsweredValue)
  })

  it('returns correctValue for non-neutral answer', () => {
    const data = createAnswerData({ 'study-place': 'teaching-participation-contact' })
    expect(readStudyPlaceCoordinate(data)).toBe(correctValue)
  })
})

describe('courseStudyPlaceCoordinate', () => {
  it('returns correctValue when course has matching study-place URN', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': 'teaching-participation-contact' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns correctValue when course has matching study-place of blended type', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-blended',
    })
    const data = createAnswerData({ 'study-place': 'teaching-participation-blended' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns incorrectValue when course URN does not match any allowed study-place answer', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': 'teaching-participation-remote' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })

  it('returns incorrectValue when study-place answer is neutral (not answered)', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': 'neutral' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })

  it('returns incorrectValue when study-place answer is unrecognized value', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': 'invalid-place' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })

  it('returns incorrectValue when course has empty URN', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: '',
    })
    const data = createAnswerData({ 'study-place': 'teaching-participation-contact' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })
})
