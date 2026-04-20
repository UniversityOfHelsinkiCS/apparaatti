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
  it('returns correctValue for neutral (always filter exams)', () => {
    const data = createAnswerData({ 'study-place': 'neutral' })
    expect(readStudyPlaceCoordinate(data)).toBe(correctValue)
  })

  it('returns correctValue for non-neutral answer', () => {
    const data = createAnswerData({ 'study-place': 'teaching-participation-contact' })
    expect(readStudyPlaceCoordinate(data)).toBe(correctValue)
  })
})

describe('courseStudyPlaceCoordinate', () => {
  const assertCourseStudyPlaceCoordinate = ({
    courseName = 'Regular course',
    courseUrn,
    studyPlace,
    expected,
  }: {
    courseName?: string
    courseUrn: string
    studyPlace: unknown
    expected: number
  }) => {
    const course = createMinimalCourse({
      name: { fi: courseName },
      courseUnitRealisationTypeUrn: courseUrn,
    })
    const data = createAnswerData({ 'study-place': studyPlace as AnswerData['study-place'] })

    expect(courseStudyPlaceCoordinate(course, data)).toBe(expected)
  }

  it.each([
    {
      title: 'non-exam course when no study-place is selected',
      courseName: 'Regular course',
      courseUrn: 'urn:code:realisation-type:teaching-participation-blended',
      studyPlace: '',
      expected: correctValue,
    },
    {
      title: 'exam course when no study-place is selected',
      courseName: 'Lopputentti',
      courseUrn: 'urn:code:realisation-type:teaching-participation-contact',
      studyPlace: '',
      expected: incorrectValue,
    },
    {
      title: 'non-exam course when answer is neutral',
      courseName: 'Regular course',
      courseUrn: 'urn:code:realisation-type:teaching-participation-contact',
      studyPlace: 'neutral',
      expected: correctValue,
    },
  ])('handles $title', ({ courseName, courseUrn, studyPlace, expected }) => {
    assertCourseStudyPlaceCoordinate({ courseName, courseUrn, studyPlace, expected })
  })

  it.each([
    {
      title: 'matching contact URN',
      courseUrn: 'urn:code:realisation-type:teaching-participation-contact',
      studyPlace: 'teaching-participation-contact',
      expected: correctValue,
    },
    {
      title: 'matching blended URN',
      courseUrn: 'urn:code:realisation-type:teaching-participation-blended',
      studyPlace: 'teaching-participation-blended',
      expected: correctValue,
    },
    {
      title: 'online alias with remote URN',
      courseUrn: 'urn:code:realisation-type:teaching-participation-remote',
      studyPlace: 'online',
      expected: correctValue,
    },
    {
      title: 'online alias with online URN',
      courseUrn: 'urn:code:realisation-type:teaching-participation-online',
      studyPlace: 'online',
      expected: correctValue,
    },
    {
      title: 'non-matching URN',
      courseUrn: 'urn:code:realisation-type:teaching-participation-contact',
      studyPlace: 'teaching-participation-remote',
      expected: incorrectValue,
    },
    {
      title: 'unrecognized study-place value',
      courseUrn: 'urn:code:realisation-type:teaching-participation-contact',
      studyPlace: 'invalid-place',
      expected: incorrectValue,
    },
    {
      title: 'empty course URN',
      courseUrn: '',
      studyPlace: 'teaching-participation-contact',
      expected: incorrectValue,
    },
  ])('returns expected value for $title', ({ courseUrn, studyPlace, expected }) => {
    assertCourseStudyPlaceCoordinate({ courseUrn, studyPlace, expected })
  })

  it.each([
    {
      title: 'exam not selected',
      studyPlace: ['online'],
      expected: incorrectValue,
    },
    {
      title: 'exam selected as single array value',
      studyPlace: ['exam'],
      expected: correctValue,
    },
    {
      title: 'exam selected as scalar value',
      studyPlace: 'exam',
      expected: correctValue,
    },
    {
      title: 'exam selected among multiple selections',
      studyPlace: ['online', 'exam'],
      expected: correctValue,
    },
  ])('handles exam course when $title', ({ studyPlace, expected }) => {
    assertCourseStudyPlaceCoordinate({
      courseName: 'Lopputentti',
      courseUrn: 'urn:code:realisation-type:teaching-participation-contact',
      studyPlace,
      expected,
    })
  })

  it.each([
    {
      title: 'independent is not selected but another selected option matches',
      courseUrn: 'urn:code:realisation-type:teaching-participation-online',
      studyPlace: ['online'],
      expected: correctValue,
    },
    {
      title: 'independent is selected',
      courseUrn: 'urn:code:realisation-type:teaching-participation-online',
      studyPlace: ['independent'],
      expected: correctValue,
    },
    {
      title: 'independent is among multiple selections',
      courseUrn: 'urn:code:realisation-type:teaching-participation-contact',
      studyPlace: ['online', 'independent'],
      expected: correctValue,
    },
  ])('handles independent course when $title', ({ courseUrn, studyPlace, expected }) => {
    assertCourseStudyPlaceCoordinate({
      courseName: 'Itsenäinen opiskelu',
      courseUrn,
      studyPlace,
      expected,
    })
  })

  it.each([
    {
      title: 'blended course',
      courseName: 'Regular blended course',
      courseUrn: 'urn:code:realisation-type:teaching-participation-blended',
      expected: incorrectValue,
    },
    {
      title: 'contact course',
      courseName: 'Regular contact course',
      courseUrn: 'urn:code:realisation-type:teaching-participation-contact',
      expected: correctValue,
    },
    {
      title: 'online course',
      courseName: 'Regular online course',
      courseUrn: 'urn:code:realisation-type:teaching-participation-online',
      expected: correctValue,
    },
    {
      title: 'exam course',
      courseName: 'Lopputentti',
      courseUrn: 'urn:code:realisation-type:teaching-participation-contact',
      expected: correctValue,
    },
  ])('handles mixed selections online + exam + contact for $title', ({ courseName, courseUrn, expected }) => {
    assertCourseStudyPlaceCoordinate({
      courseName,
      courseUrn,
      studyPlace: ['online', 'exam', 'contact'],
      expected,
    })
  })
})
