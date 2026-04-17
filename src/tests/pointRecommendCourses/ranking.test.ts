import { describe, expect, it } from 'vitest'
import pointRecommendedCourses from '../../server/util/pointRecommendCourses.ts'
import { createRecommendation, createUserCoordinates } from './testUtils.ts'

describe('pointRecommendCourses', () => {
  it('sorts courses by points in descending order', () => {
    const user = createUserCoordinates({ mooc: 1 })

    const higherScore = createRecommendation('higher-score', {
      coordinates: { mooc: 1 },
    })
    const lowerScore = createRecommendation('lower-score', {
      coordinates: { mooc: 0 },
    })

    const result = pointRecommendedCourses([lowerScore, higherScore], user, [])

    expect(result.map((course) => course.course.id)).toEqual([
      'higher-score',
      'lower-score',
    ])
  })

  it('adds non-generic mandatory bonus point when not challenge course', () => {
    const user = createUserCoordinates()

    const nonGeneric = createRecommendation('non-generic', {
      course: { courseCodes: ['ABC-123'] },
      coordinates: { mentoring: 0, challenge: 0 },
    })
    const generic = createRecommendation('generic', {
      course: { courseCodes: ['KAIKKI'] },
      coordinates: { mentoring: 0, challenge: 0 },
    })

    const result = pointRecommendedCourses([nonGeneric, generic], user, [])
    const nonGenericPoints = result.find((course) => course.course.id === 'non-generic')?.points
    const genericPoints = result.find((course) => course.course.id === 'generic')?.points

    expect(nonGenericPoints).toBeDefined()
    expect(genericPoints).toBeDefined()
    expect(nonGenericPoints).toBe((genericPoints as number) + 1)
  })

  it('ranks courses: specific > KAIKKI > numbered > ERI', () => {
    const user = createUserCoordinates()

    const specific = createRecommendation('specific', {
      course: { courseCodes: ['RUFARM'] },
      coordinates: { mentoring: 0, challenge: 0 },
    })
    const kaikki = createRecommendation('kaikki', {
      course: { courseCodes: ['RUKAIKKI'] },
      coordinates: { mentoring: 0, challenge: 0 },
    })
    const numbered = createRecommendation('numbered', {
      course: { courseCodes: ['RU123'] },
      coordinates: { mentoring: 1, challenge: 0 },
    })
    const eri = createRecommendation('eri', {
      course: { courseCodes: ['RUERI'] },
      coordinates: { mentoring: 0, challenge: 1 },
    })

    const result = pointRecommendedCourses([numbered, eri, kaikki, specific], user, [])
    const ids = result.map((c) => c.course.id)

    expect(ids.indexOf('specific')).toBeLessThan(ids.indexOf('kaikki'))
    expect(ids.indexOf('kaikki')).toBeLessThan(ids.indexOf('numbered'))
    expect(ids.indexOf('numbered')).toBeLessThan(ids.indexOf('eri'))
  })
})
