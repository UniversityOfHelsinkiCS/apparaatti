import { describe, expect, it } from 'vitest'
import type { CourseRecommendation, UserCoordinates } from '../../common/types.ts'
import pointRecommendedCourses from '../../server/util/pointRecommendCourses.ts'
import { createRecommendation, createUserCoordinates } from './testUtils.ts'

describe('pointRecommendCourses', () => {
  it('filters out exam courses when exam is a strict field and user coordinate is no', () => {
    const user = createUserCoordinates({ exam: 0 })

    const examCourse = createRecommendation('exam-filtered', {
      course: { name: { fi: 'Lopputentti' } },
      coordinates: { exam: 1 },
    })
    const nonExamCourse = createRecommendation('non-exam-allowed', {
      course: { name: { fi: 'Regular course' } },
      coordinates: { exam: 0 },
    })

    const result = pointRecommendedCourses(
      [examCourse, nonExamCourse],
      user,
      ['exam']
    )

    expect(result.map((course) => course.course.id)).toEqual(['non-exam-allowed'])
  })

  it('keeps exam courses when exam is not a strict field', () => {
    const user = createUserCoordinates({ exam: 0 })

    const examCourse = createRecommendation('exam-course', {
      course: { name: { fi: 'Lopputentti' } },
      coordinates: { exam: 1 },
    })
    const nonExamCourse = createRecommendation('non-exam-course', {
      course: { name: { fi: 'Regular course' } },
      coordinates: { exam: 0 },
    })

    const result = pointRecommendedCourses(
      [examCourse, nonExamCourse],
      user,
      []
    )

    expect(result).toHaveLength(2)
  })

  it('filters on strict fields and keeps non-strict mismatches', () => {
    const user = createUserCoordinates({ mooc: 1 })
    const moocMismatch = createRecommendation('mooc-mismatch', {
      coordinates: { mooc: 0 },
    })

    const strictResult = pointRecommendedCourses([moocMismatch], user, ['mooc'])
    const nonStrictResult = pointRecommendedCourses([moocMismatch], user, [])

    expect(strictResult).toEqual([])
    expect(nonStrictResult).toHaveLength(1)
  })

  it('filters out multiPeriod mismatches when strict', () => {
    const user = createUserCoordinates({ multiPeriod: 1 })
    const mismatch = createRecommendation('multi-miss', {
      coordinates: { multiPeriod: 0 },
    })

    const result = pointRecommendedCourses([mismatch], user, ['multi-period'])

    expect(result).toEqual([])
  })

  it('applies strict filtering for all configurable strict fields', () => {
    const strictCases: Array<{
      strictField: string
      coordinateField: keyof CourseRecommendation['coordinates']
    }> = [
      { strictField: 'collaboration', coordinateField: 'collaboration' },
      { strictField: 'mooc', coordinateField: 'mooc' },
      { strictField: 'mentoring', coordinateField: 'mentoring' },
      { strictField: 'challenge', coordinateField: 'challenge' },
      { strictField: 'replacement', coordinateField: 'replacement' },
      { strictField: 'graduation', coordinateField: 'graduation' },
      { strictField: 'flexible', coordinateField: 'flexible' },
      { strictField: 'integrated', coordinateField: 'integrated' },
      { strictField: 'study-place', coordinateField: 'studyPlace' },
      { strictField: 'multi-period', coordinateField: 'multiPeriod' },
    ]

    for (const testCase of strictCases) {
      const user = createUserCoordinates({
        [testCase.coordinateField]: 1,
      } as Partial<UserCoordinates>)

      const mismatch = createRecommendation(`mismatch-${testCase.strictField}`, {
        coordinates: {
          [testCase.coordinateField]: 0,
        } as Partial<CourseRecommendation['coordinates']>,
      })

      const result = pointRecommendedCourses([mismatch], user, [testCase.strictField])
      expect(result).toEqual([])
    }
  })

  it('filters out spesificOrg mismatches when spesificOrg is a strict field (Finnish Finnish)', () => {
    const user = createUserCoordinates({ spesificOrg: 1 })
    const specificCourse = createRecommendation('specific-org-match', {
      coordinates: { spesificOrg: 1 },
    })
    const genericCourse = createRecommendation('specific-org-miss', {
      coordinates: { spesificOrg: 0 },
    })

    const result = pointRecommendedCourses([specificCourse, genericCourse], user, ['spesificOrg'])

    expect(result.map((c) => c.course.id)).toEqual(['specific-org-match'])
  })

  it('always enforces spesificOrg as strict even when not listed in strictFields', () => {
    const user = createUserCoordinates({ spesificOrg: 1 })
    const specificCourse = createRecommendation('specific-org-match', {
      coordinates: { spesificOrg: 1 },
    })
    const genericCourse = createRecommendation('specific-org-miss', {
      coordinates: { spesificOrg: 0 },
    })

    const result = pointRecommendedCourses([specificCourse, genericCourse], user, [])

    expect(result.map((c) => c.course.id)).toEqual(['specific-org-match'])
  })

  it('always enforces org as strict even when not listed in strictFields', () => {
    const user = createUserCoordinates({ org: 1 })
    const mismatch = createRecommendation('org-mismatch', {
      coordinates: { org: 0 },
    })

    const result = pointRecommendedCourses([mismatch], user, [])

    expect(result).toEqual([])
  })
})
