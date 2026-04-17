import { describe, expect, it } from 'vitest'
import pointRecommendedCourses from '../../server/util/pointRecommendCourses.ts'
import { createRecommendation, createUserCoordinates } from './testUtils.ts'

describe('pointRecommendCourses', () => {
  it('gives replacement filter extra reward points when it matches', () => {
    const user = createUserCoordinates({ replacement: 1 })

    const replacementMatch = createRecommendation('replacement-match', {
      coordinates: { replacement: 1 },
    })
    const replacementMiss = createRecommendation('replacement-miss', {
      coordinates: { replacement: 0 },
    })

    const result = pointRecommendedCourses([replacementMatch, replacementMiss], user, [])
    const matchPoints = result.find((course) => course.course.id === 'replacement-match')?.points
    const missPoints = result.find((course) => course.course.id === 'replacement-miss')?.points

    expect(matchPoints).toBeDefined()
    expect(missPoints).toBeDefined()
    expect((matchPoints as number) - (missPoints as number)).toBe(5)
  })

  it('awards points for finmu and independent when they match user coordinates', () => {
    const user = createUserCoordinates({ finmu: 1, independent: 1 })

    const matchingCourse = createRecommendation('finmu-independent-match', {
      coordinates: { finmu: 1, independent: 1 },
    })
    const mismatchingCourse = createRecommendation('finmu-independent-miss', {
      coordinates: { finmu: 0, independent: 0 },
    })

    const result = pointRecommendedCourses([matchingCourse, mismatchingCourse], user, [])
    const matchPoints = result.find((course) => course.course.id === 'finmu-independent-match')?.points
    const missPoints = result.find((course) => course.course.id === 'finmu-independent-miss')?.points

    expect(matchPoints).toBeDefined()
    expect(missPoints).toBeDefined()
    expect((matchPoints as number) - (missPoints as number)).toBe(20)
  })
})
