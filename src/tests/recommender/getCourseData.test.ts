import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the database layer, the rest (data.xlsx recommendation table, filtering, sorting) runs for real
vi.mock('../../server/util/dbActions.ts', () => ({
  cuWithCourseCodeOf: vi.fn(),
  curcusWithUnitIdOf: vi.fn(),
  curWithIdOf: vi.fn(),
  organisationWithGroupIdOf: vi.fn(),
}))

import type { AnswerData } from '../../common/types.ts'
import { curcusWithUnitIdOf, curWithIdOf, cuWithCourseCodeOf } from '../../server/util/dbActions.ts'
import { getCourseData } from '../../server/util/recommender.ts'

const PSYKOLOGIA = '414'
const HAMMASLAAKETIEDE = 'H305'

const apparaattiUrn = (code: string) => ({
  'urn:code:custom:hy-university-root-id:kk-apparaatti': [
    `urn:code:custom:hy-university-root-id:kk-apparaatti:${code}`,
  ],
})

type FakeCourseUnit = { id: string; courseCode: string; groupId: string; credits: Record<string, number> }
type FakeRealisation = {
  id: string
  courseUnitId: string
  name: { fi: string }
  customCodeUrns: Record<string, string[]>
}

// KK-ENLAAK is listed for both psykologia and hammaslääketiede in data.xlsx, so realisations of it
// end up in the candidate set for a psychology student and may only be dropped by the organisation filter
const courseUnits: FakeCourseUnit[] = [
  { id: 'cu-enlaak', courseCode: 'KK-ENLAAK', groupId: 'group-enlaak', credits: { min: 5, max: 5 } },
  { id: 'cu-enkaikki', courseCode: 'KK-ENKAIKKI', groupId: 'group-enkaikki', credits: { min: 4, max: 4 } },
  { id: 'cu-eneri', courseCode: 'KK-ENERI', groupId: 'group-eneri', credits: { min: 2, max: 2 } },
  { id: 'cu-rulaak', courseCode: 'KK-RULAAK', groupId: 'group-rulaak', credits: { min: 3, max: 3 } },
]

const realisations: FakeRealisation[] = [
  {
    id: 'cur-enlaak-ham',
    courseUnitId: 'cu-enlaak',
    name: { fi: 'Academic English for Dentistry' },
    customCodeUrns: apparaattiUrn('kkt-ham'),
  },
  {
    id: 'cur-enlaak-psy',
    courseUnitId: 'cu-enlaak',
    name: { fi: 'Academic English for Psychology' },
    customCodeUrns: apparaattiUrn('kkt-psy'),
  },
  {
    id: 'cur-enkaikki-psy',
    courseUnitId: 'cu-enkaikki',
    name: { fi: 'Academic and Professional Communication' },
    customCodeUrns: apparaattiUrn('kkt-psy'),
  },
  {
    id: 'cur-eneri-hum',
    courseUnitId: 'cu-eneri',
    name: { fi: 'English for humanists' },
    customCodeUrns: apparaattiUrn('kkt-hum'),
  },
  {
    id: 'cur-enkaikki-unmarked',
    courseUnitId: 'cu-enkaikki',
    name: { fi: 'Unmarked English course' },
    customCodeUrns: {},
  },
  {
    id: 'cur-rulaak-psy',
    courseUnitId: 'cu-rulaak',
    name: { fi: 'Ruotsia psykologeille' },
    customCodeUrns: apparaattiUrn('kkt-psy'),
  },
]

const answers = (overrides: Partial<AnswerData> = {}): AnswerData => ({
  'study-field-select': PSYKOLOGIA,
  lang: 'en',
  'primary-language': 'fi',
  'primary-language-specification': 'writtenAndSpoken',
  ...overrides,
})

const courseCodesOf = (courses: { courseCodes: string[] }[]) => courses.flatMap(c => c.courseCodes)

beforeEach(() => {
  vi.mocked(cuWithCourseCodeOf).mockImplementation(
    async (courseCodes: string[]) => courseUnits.filter(cu => courseCodes.includes(cu.courseCode)) as any
  )

  vi.mocked(curcusWithUnitIdOf).mockImplementation(
    async (courseUnitIds: string[]) =>
      realisations
        .filter(cur => courseUnitIds.includes(cur.courseUnitId))
        .map(cur => ({ curId: cur.id, cuId: cur.courseUnitId })) as any
  )

  vi.mocked(curWithIdOf).mockImplementation(
    async (ids: string[]) =>
      realisations
        .filter(cur => ids.includes(cur.id))
        .map(cur => ({
          id: cur.id,
          name: cur.name,
          startDate: new Date(2025, 8, 1),
          endDate: new Date(2025, 9, 15),
          customCodeUrns: cur.customCodeUrns,
          courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-contact',
          flowState: 'PUBLISHED',
        })) as any
  )
})

describe('getCourseData for a psykologian laitos student', () => {
  it('does not recommend a KK-ENLAAK realisation that is marked for hammaslääketieteellinen (kkt-ham)', async () => {
    const courses = await getCourseData(answers())

    expect(courses.map(c => c.id)).not.toContain('cur-enlaak-ham')
  })

  it('recommends the KK-ENLAAK realisation that is marked for psykologia (kkt-psy)', async () => {
    const courses = await getCourseData(answers())

    expect(courses.map(c => c.id)).toContain('cur-enlaak-psy')
  })

  it('only returns courses marked with the psykologia custom code urn', async () => {
    const courses = await getCourseData(answers())

    expect(courses.map(c => c.id).sort()).toEqual(['cur-enkaikki-psy', 'cur-enlaak-psy'])
  })

  it('does not return courses of other organisations or courses with no organisation marking', async () => {
    const courses = await getCourseData(answers())
    const ids = courses.map(c => c.id)

    expect(ids).not.toContain('cur-eneri-hum')
    expect(ids).not.toContain('cur-enkaikki-unmarked')
  })

  it('does not return course codes that are outside of the language the user asked about', async () => {
    const courses = await getCourseData(answers({ lang: 'en' }))

    // KK-RULAAK is a swedish course, it is marked for psykologia but must not show up for an english search
    expect(courseCodesOf(courses)).not.toContain('KK-RULAAK')
  })

  it('returns the swedish psykologia course when the user asks about swedish', async () => {
    const courses = await getCourseData(answers({ lang: 'sv' }))

    expect(courses.map(c => c.id)).toEqual(['cur-rulaak-psy'])
  })
})

describe('getCourseData for a hammaslääketieteellinen student', () => {
  it('recommends the KK-ENLAAK realisation marked kkt-ham and not the psykologia one', async () => {
    const courses = await getCourseData(answers({ 'study-field-select': HAMMASLAAKETIEDE }))
    const ids = courses.map(c => c.id)

    expect(ids).toContain('cur-enlaak-ham')
    expect(ids).not.toContain('cur-enlaak-psy')
  })
})
