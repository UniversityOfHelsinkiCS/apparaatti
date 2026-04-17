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
  it('returns correctValue for non-tentti course when no study-place is selected', () => {
    const course = createMinimalCourse({
      name: { fi: 'Regular course' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-blended',
    })
    const data = createAnswerData({ 'study-place': '' as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns incorrectValue for tentti course when no study-place is selected', () => {
    const course = createMinimalCourse({
      name: { fi: 'Lopputentti' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': '' as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })

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

  it('returns correctValue for online alias when course has remote URN', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-remote',
    })
    const data = createAnswerData({ 'study-place': 'online' as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns correctValue for online alias when course has online URN', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-online',
    })
    const data = createAnswerData({ 'study-place': 'online' as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns incorrectValue when course URN does not match any allowed study-place answer', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': 'teaching-participation-remote' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })

  it('returns correctValue when study-place answer is neutral (not answered) for non-tentti course', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': 'neutral' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns incorrectValue when study-place answer is unrecognized value', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': 'invalid-place' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })

  it('returns incorrectValue for tentti course when tentti is not selected', () => {
    const course = createMinimalCourse({
      name: { fi: 'Lopputentti' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': ['online'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })

  it('returns correctValue for tentti course when tentti is selected', () => {
    const course = createMinimalCourse({
      name: { fi: 'Lopputentti' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': ['tentti'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns correctValue for tentti course when tentti is selected as scalar value', () => {
    const course = createMinimalCourse({
      name: { fi: 'Lopputentti' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': 'tentti' as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns correctValue for tentti course when tentti is among multiple selections', () => {
    const course = createMinimalCourse({
      name: { fi: 'Lopputentti' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': ['online', 'tentti'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns correctValue for independent course when independent is not selected but another selected option matches', () => {
    const course = createMinimalCourse({
      name: { fi: 'Itsenäinen opiskelu' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-online',
    })
    const data = createAnswerData({ 'study-place': ['online'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns correctValue for independent course when independent is selected', () => {
    const course = createMinimalCourse({
      name: { fi: 'Itsenäinen opiskelu' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-online',
    })
    const data = createAnswerData({ 'study-place': ['independent'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns correctValue for independent course when independent is among multiple selections', () => {
    const course = createMinimalCourse({
      name: { fi: 'Itsenäinen opiskelu' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': ['online', 'independent'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns incorrectValue for blended course when selected options are online + tentti + contact', () => {
    const course = createMinimalCourse({
      name: { fi: 'Regular blended course' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-blended',
    })
    const data = createAnswerData({ 'study-place': ['online', 'tentti', 'contact'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })

  it('returns correctValue for contact course when selected options are online + tentti + contact', () => {
    const course = createMinimalCourse({
      name: { fi: 'Regular contact course' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': ['online', 'tentti', 'contact'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns correctValue for online course when selected options are online + tentti + contact', () => {
    const course = createMinimalCourse({
      name: { fi: 'Regular online course' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-online',
    })
    const data = createAnswerData({ 'study-place': ['online', 'tentti', 'contact'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns correctValue for tentti course when selected options are online + tentti + contact', () => {
    const course = createMinimalCourse({
      name: { fi: 'Lopputentti' },
      courseUnitRealisationTypeUrn: 'urn:code:realisation-type:teaching-participation-contact',
    })
    const data = createAnswerData({ 'study-place': ['online', 'tentti', 'contact'] as any })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(correctValue)
  })

  it('returns incorrectValue when course has empty URN', () => {
    const course = createMinimalCourse({
      courseUnitRealisationTypeUrn: '',
    })
    const data = createAnswerData({ 'study-place': 'teaching-participation-contact' })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(incorrectValue)
  })
})
