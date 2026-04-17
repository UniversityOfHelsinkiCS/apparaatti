import { describe, expect, it } from 'vitest'
import pointRecommendedCourses from '../../server/util/pointRecommendCourses.ts'
import { createRecommendation, createUserCoordinates } from './testUtils.ts'

describe('pointRecommendCourses', () => {
  it('enforces studyYear comparison when configured strict and allows neutral year', () => {
    const matchingYear = createRecommendation('year-match', {
      course: {
        period: [
          {
            name: 'period_1',
            startDate: new Date(2025, 8, 1),
            endDate: new Date(2025, 9, 19),
            startYear: '2025',
            endYear: '2026',
          },
        ],
      },
    })
    const nonMatchingYear = createRecommendation('year-miss', {
      course: {
        period: [
          {
            name: 'period_1',
            startDate: new Date(2026, 8, 1),
            endDate: new Date(2026, 9, 19),
            startYear: '2026',
            endYear: '2027',
          },
        ],
      },
    })

    const strictUser = createUserCoordinates({ studyYear: '2025' })
    const strictResult = pointRecommendedCourses(
      [matchingYear, nonMatchingYear],
      strictUser,
      ['study-year']
    )

    expect(strictResult.map((course) => course.course.id)).toEqual(['year-match'])

    const nonStrictResult = pointRecommendedCourses(
      [matchingYear, nonMatchingYear],
      strictUser,
      []
    )

    expect(nonStrictResult).toHaveLength(2)

    const neutralUser = createUserCoordinates({ studyYear: 'neutral' })
    const neutralResult = pointRecommendedCourses([nonMatchingYear], neutralUser, [])

    expect(neutralResult).toHaveLength(1)
  })

  it('enforces studyPeriod comparison when configured strict and allows neutral period', () => {
    const periodMatch = createRecommendation('period-match', {
      course: { startDate: new Date(2025, 8, 10) },
    })
    const periodMiss = createRecommendation('period-miss', {
      course: { startDate: new Date(2025, 10, 10) },
    })

    const strictUser = createUserCoordinates({ studyPeriod: ['period_1'] })
    const strictResult = pointRecommendedCourses(
      [periodMatch, periodMiss],
      strictUser,
      ['study-period']
    )

    expect(strictResult.map((course) => course.course.id)).toEqual(['period-match'])

    const nonStrictResult = pointRecommendedCourses(
      [periodMatch, periodMiss],
      strictUser,
      []
    )

    expect(nonStrictResult).toHaveLength(2)

    const neutralUser = createUserCoordinates({ studyPeriod: ['neutral'] })
    const neutralResult = pointRecommendedCourses([periodMiss], neutralUser, [])

    expect(neutralResult).toHaveLength(1)
  })

  it('treats date comparison as always matching', () => {
    const user = createUserCoordinates({ date: 999999 })

    const earlyDate = createRecommendation('early-date', {
      coordinates: { date: 1 },
    })
    const lateDate = createRecommendation('late-date', {
      coordinates: { date: 99999999 },
    })

    const result = pointRecommendedCourses([earlyDate, lateDate], user, [])
    const earlyPoints = result.find((course) => course.course.id === 'early-date')?.points
    const latePoints = result.find((course) => course.course.id === 'late-date')?.points

    expect(result).toHaveLength(2)
    expect(earlyPoints).toBe(latePoints)
  })
})
