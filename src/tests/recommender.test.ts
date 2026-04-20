import { describe, it, expect, vi } from 'vitest'
import recommendCourses, { readAnswer } from '../server/util/recommender'
import pointRecommendCourses from '../server/util/pointRecommendCourses'
import type { CourseRecommendation, UserCoordinates, CourseData } from '../common/types'

vi.mock('../server/util/dbActions.ts', () => ({
  cuWithCourseCodeOf: vi.fn().mockResolvedValue([]),
  curWithIdOf: vi.fn().mockResolvedValue([]),
  curcusWithUnitIdOf: vi.fn().mockResolvedValue([]),
  organisationWithGroupIdOf: vi.fn().mockResolvedValue([]),
}))


describe('recommender tests', () => {
  it('passes', () => {
    const val = true
    expect(val === true)
  })

  it('recommender returns an empty answer with a invalid input', async() => {
    await recommendCourses({})
  })

  describe('readAnswer', () => {
    it('returns "neutral" when value is undefined', () => {
      const answerData = {}
      const result = readAnswer(answerData, 'study-period')
      expect(result).toBe('neutral')
    })

    it('returns "neutral" when value is an empty array', () => {
      const answerData = { 'study-period': [] }
      const result = readAnswer(answerData, 'study-period')
      expect(result).toBe('neutral')
    })

    it('returns the array when value is a non-empty array', () => {
      const answerData = { 'study-period': ['period_1', 'period_2'] }
      const result = readAnswer(answerData, 'study-period')
      expect(result).toEqual(['period_1', 'period_2'])
    })

    it('returns the string when value is a string', () => {
      const answerData = { 'lang': 'fi' }
      const result = readAnswer(answerData, 'lang')
      expect(result).toBe('fi')
    })

    it('returns "neutral" when value is null', () => {
      const answerData = { 'study-period': null }
      const result = readAnswer(answerData, 'study-period')
      expect(result).toBe('neutral')
    })

    it('returns "neutral" when value is an empty string', () => {
      const answerData = { 'study-period': '' }
      const result = readAnswer(answerData, 'study-period')
      expect(result).toBe('neutral')
    })
  })

  describe('pointRecommendCourses with strict fields', () => {
    const mockCourse: CourseData = {
      id: 'course-1',
      name: { fi: 'Test Course', en: 'Test Course', sv: 'Test Course' },
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      period: [{
        name: 'period_1',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-10-31'),
        startYear: '2024',
        endYear: '2024'
      }],
      customCodeUrns: {},
      courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation',
      courseCodes: ['TEST-101'],
      groupIds: ['group-1'],
      unitIds: ['unit-1'],
      credits: [{ fi: 5, en: 5, sv: 5 }],
      flowState: 'PUBLISHED'
    }

    it('does not filter out courses when study-period is not answered (neutral) even if strict', () => {
      const courseRecommendation: CourseRecommendation = {
        course: mockCourse,
        coordinates: {
          date: new Date('2024-09-01').getTime(),
          org: 1,
          spesificOrg: 1,
          lang: 1,
          graduation: 0,
          mentoring: 0,
          integrated: 0,
          studyPlace: 1,
          replacement: 0,
          challenge: 0,
          independent: 0,
          flexible: 0,
          mooc: 0,
          finmu: 0,
          collaboration: 0,
          multiPeriod: 0,
        }
      }

      const userCoordinates: UserCoordinates = {
        date: new Date('2024-09-01').getTime(),
        org: 1,
        spesificOrg: 1,
        lang: 1,
        graduation: 0,
        mentoring: 0,
        integrated: 0,
        studyPlace: 1,
        replacement: 0,
        challenge: 0,
        independent: 0,
        flexible: 0,
        mooc: 0,
        finmu: 0,
        collaboration: 0,
        studyYear: 'neutral',
        studyPeriod: ['neutral'], // User hasn't answered - should not filter
        multiPeriod: null,
      }

      // Even with 'study-period' in strict fields, courses should not be filtered
      // when studyPeriod is 'neutral' (unanswered)
      const strictFields = ['study-period']
      const result = pointRecommendCourses([courseRecommendation], userCoordinates, strictFields)

      expect(result.length).toBe(1)
      expect(result[0].points).toBeGreaterThan(0)
    })

    it('filters out courses when study-period is answered and does not match and is strict', () => {
      const courseRecommendation: CourseRecommendation = {
        course: {
          ...mockCourse,
          startDate: new Date('2024-09-01'), // period_1
        },
        coordinates: {
          date: new Date('2024-09-01').getTime(),
          org: 1,
          spesificOrg: 1,
          lang: 1,
          graduation: 0,
          mentoring: 0,
          integrated: 0,
          studyPlace: 1,
          replacement: 0,
          challenge: 0,
          independent: 0,
          flexible: 0,
          mooc: 0,
          finmu: 0,
          collaboration: 0,
          multiPeriod: 0,
        }
      }

      const userCoordinates: UserCoordinates = {
        date: new Date('2024-09-01').getTime(),
        org: 1,
        spesificOrg: 1,
        lang: 1,
        graduation: 0,
        mentoring: 0,
        integrated: 0,
        studyPlace: 1,
        replacement: 0,
        challenge: 0,
        independent: 0,
        flexible: 0,
        mooc: 0,
        finmu: 0,
        collaboration: 0,
        studyYear: '2024',
        studyPeriod: ['period_3'], // User wants period_3, course is period_1
        multiPeriod: null,
      }

      const strictFields = ['study-period']
      const result = pointRecommendCourses([courseRecommendation], userCoordinates, strictFields)

      // Course should be filtered out (negative points)
      expect(result.length).toBe(0)
    })

    it('includes matching courses when study-period is answered and matches', () => {
      const courseRecommendation: CourseRecommendation = {
        course: {
          ...mockCourse,
          startDate: new Date('2024-09-01'), // period_1
        },
        coordinates: {
          date: new Date('2024-09-01').getTime(),
          org: 1,
          spesificOrg: 1,
          lang: 1,
          graduation: 0,
          mentoring: 0,
          integrated: 0,
          studyPlace: 1,
          replacement: 0,
          challenge: 0,
          independent: 0,
          flexible: 0,
          mooc: 0,
          finmu: 0,
          collaboration: 0,
          multiPeriod: 0,
        }
      }

      const userCoordinates: UserCoordinates = {
        date: new Date('2024-09-01').getTime(),
        org: 1,
        spesificOrg: 1,
        lang: 1,
        graduation: 0,
        mentoring: 0,
        integrated: 0,
        studyPlace: 1,
        replacement: 0,
        challenge: 0,
        independent: 0,
        flexible: 0,
        mooc: 0,
        finmu: 0,
        collaboration: 0,
        studyYear: '2024',
        studyPeriod: ['period_1'], // User wants period_1, course is period_1
        multiPeriod: null,
      }

      const strictFields = ['study-period']
      const result = pointRecommendCourses([courseRecommendation], userCoordinates, strictFields)

      expect(result.length).toBe(1)
      expect(result[0].points).toBeGreaterThan(0)
    })
  })

  describe('exam course filtering', () => {
    const mockExamCourse: CourseData = {
      id: 'exam-1',
      name: { fi: 'Suomen kielen tentti', en: 'Finnish language exam', sv: 'Finska språket tentamen' },
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      period: [{
        name: 'period_1',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-10-31'),
        startYear: '2024',
        endYear: '2024'
      }],
      customCodeUrns: {},
      courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation',
      courseCodes: ['FIN-EXAM-101'],
      groupIds: ['group-1'],
      unitIds: ['unit-1'],
      credits: [{ fi: 0, en: 0, sv: 0 }],
      flowState: 'PUBLISHED'
    }

    it('filters out exam courses when user has not selected exam in study-place', () => {
      const examRecommendation: CourseRecommendation = {
        course: mockExamCourse,
        coordinates: {
          date: new Date('2024-09-01').getTime(),
          org: 1,
          spesificOrg: 1,
          lang: 1,
          graduation: 0,
          mentoring: 0,
          integrated: 0,
          studyPlace: 0, // Exam course gets 0 when exam not selected
          replacement: 0,
          challenge: 0,
          independent: 0,
          flexible: 0,
          mooc: 0,
          finmu: 0,
          collaboration: 0,
          multiPeriod: 0,
        }
      }

      const userCoordinates: UserCoordinates = {
        date: new Date('2024-09-01').getTime(),
        org: 1,
        spesificOrg: 1,
        lang: 1,
        graduation: 0,
        mentoring: 0,
        integrated: 0,
        studyPlace: 1, // User coordinate is always 1 now
        replacement: 0,
        challenge: 0,
        independent: 0,
        flexible: 0,
        mooc: 0,
        finmu: 0,
        collaboration: 0,
        studyYear: '2024',
        studyPeriod: ['period_1'],
        multiPeriod: null,
      }

      const strictFields: string[] = []
      const result = pointRecommendCourses([examRecommendation], userCoordinates, strictFields)

      // Exam course should be filtered out (coordinate mismatch: course=0, user=1)
      expect(result.length).toBe(0)
    })

    it('includes exam courses when user has selected exam in study-place', () => {
      const examRecommendation: CourseRecommendation = {
        course: mockExamCourse,
        coordinates: {
          date: new Date('2024-09-01').getTime(),
          org: 1,
          spesificOrg: 1,
          lang: 1,
          graduation: 0,
          mentoring: 0,
          integrated: 0,
          studyPlace: 1, // Exam course gets 1 when exam IS selected
          replacement: 0,
          challenge: 0,
          independent: 0,
          flexible: 0,
          mooc: 0,
          finmu: 0,
          collaboration: 0,
          multiPeriod: 0,
        }
      }

      const userCoordinates: UserCoordinates = {
        date: new Date('2024-09-01').getTime(),
        org: 1,
        spesificOrg: 1,
        lang: 1,
        graduation: 0,
        mentoring: 0,
        integrated: 0,
        studyPlace: 1, // User coordinate is always 1
        replacement: 0,
        challenge: 0,
        independent: 0,
        flexible: 0,
        mooc: 0,
        finmu: 0,
        collaboration: 0,
        studyYear: '2024',
        studyPeriod: ['period_1'],
        multiPeriod: null,
      }

      const strictFields: string[] = []
      const result = pointRecommendCourses([examRecommendation], userCoordinates, strictFields)

      // Exam course should be included (coordinate match: course=1, user=1)
      expect(result.length).toBe(1)
      expect(result[0].points).toBeGreaterThan(0)
    })
  })

})
