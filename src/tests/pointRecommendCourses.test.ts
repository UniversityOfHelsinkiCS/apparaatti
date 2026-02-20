import { describe, expect, it } from 'vitest'
import type { CourseRecommendation, UserCoordinates } from '../common/types.ts'
import pointRecommendedCourses from '../server/util/pointRecommendCourses.ts'

type CourseRecommendationOverride = Partial<CourseRecommendation> & {
  course?: Partial<CourseRecommendation['course']>
  coordinates?: Partial<CourseRecommendation['coordinates']>
}

const createUserCoordinates = (
  overrides: Partial<UserCoordinates> = {}
): UserCoordinates => ({
  date: 0,
  org: 1,
  spesificOrg: 0,
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
  studyPeriod: ['neutral'],
  multiPeriod: 0,
  ...overrides,
})

const createRecommendation = (
  id: string,
  overrides: CourseRecommendationOverride = {}
): CourseRecommendation => ({
  course: {
    id,
    name: { fi: 'Kurssi' },
    startDate: new Date(2025, 8, 10),
    endDate: new Date(2025, 8, 12),
    period: [
      {
        name: 'period_1',
        startDate: new Date(2025, 8, 1),
        endDate: new Date(2025, 9, 19),
        startYear: '2025',
        endYear: '2026',
      },
    ],
    customCodeUrns: {},
    courseUnitRealisationTypeUrn: '',
    courseCodes: ['ABC-123'],
    groupIds: [],
    unitIds: [],
    credits: [],
    ...(overrides.course || {}),
  },
  distance: overrides.distance ?? 0,
  coordinates: {
    date: 0,
    org: 1,
    spesificOrg: 0,
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
    studyYear: '2025',
    studyPeriod: ['period_1'],
    multiPeriod: 0,
    ...(overrides.coordinates || {}),
  },
  points: overrides.points ?? 0,
})

describe('pointRecommendCourses', () => {
  it('filters out exam courses unless replacement is positive', () => {
    const user = createUserCoordinates()

    const examCourse = createRecommendation('exam-filtered', {
      course: { name: { fi: 'Lopputentti' } },
      coordinates: { replacement: 0 },
    })
    const replacementExamCourse = createRecommendation('exam-allowed', {
      course: { name: { fi: 'Korvaava tentti' } },
      coordinates: { replacement: 1 },
    })

    const result = pointRecommendedCourses(
      [examCourse, replacementExamCourse],
      user,
      []
    )

    expect(result.map((course) => course.course.id)).toEqual(['exam-allowed'])
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

  it('enforces studyYear comparison and allows neutral year', () => {
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
      []
    )

    expect(strictResult.map((course) => course.course.id)).toEqual(['year-match'])

    const neutralUser = createUserCoordinates({ studyYear: 'neutral' })
    const neutralResult = pointRecommendedCourses([nonMatchingYear], neutralUser, [])

    expect(neutralResult).toHaveLength(1)
  })

  it('enforces studyPeriod comparison and allows neutral period', () => {
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
      []
    )

    expect(strictResult.map((course) => course.course.id)).toEqual(['period-match'])

    const neutralUser = createUserCoordinates({ studyPeriod: ['neutral'] })
    const neutralResult = pointRecommendedCourses([periodMiss], neutralUser, [])

    expect(neutralResult).toHaveLength(1)
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

  it('always enforces org as strict even when not listed in strictFields', () => {
    const user = createUserCoordinates({ org: 1 })
    const mismatch = createRecommendation('org-mismatch', {
      coordinates: { org: 0 },
    })

    const result = pointRecommendedCourses([mismatch], user, [])

    expect(result).toEqual([])
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
    expect((matchPoints as number) - (missPoints as number)).toBe(4)
  })
})
