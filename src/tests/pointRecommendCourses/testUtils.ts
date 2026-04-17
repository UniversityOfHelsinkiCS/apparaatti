import type { CourseRecommendation, UserCoordinates } from '../../common/types.ts'

export type CourseRecommendationOverride = Partial<CourseRecommendation> & {
  course?: Partial<CourseRecommendation['course']>
  coordinates?: Partial<CourseRecommendation['coordinates']>
}

export const createUserCoordinates = (
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

export const createRecommendation = (
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
