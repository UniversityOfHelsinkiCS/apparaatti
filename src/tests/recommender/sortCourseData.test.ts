import { describe, expect, it, vi } from 'vitest'

vi.mock('../../server/util/dbActions.ts', () => ({
  curcusWithUnitIdOf: vi.fn(),
  curWithIdOf: vi.fn(),
  cuWithCourseCodeOf: vi.fn(),
  organisationWithGroupIdOf: vi.fn(),
}))

import type { CourseData } from '../../common/types.ts'
import { sortCourseData } from '../../server/util/recommender.ts'

function createCourse(id: string, courseCodes: string[], nameFi = id): CourseData {
  const now = new Date()
  return {
    id,
    name: { fi: nameFi },
    startDate: now,
    endDate: now,
    period: null,
    customCodeUrns: {},
    courseUnitRealisationTypeUrn: '',
    normalizedStudyPlace: null,
    courseCodes,
    groupIds: [],
    unitIds: [],
    credits: [],
    flowState: null,
  }
}

describe('sortCourseData', () => {
  it('orders courses by heuristic: faculty-specific mandatory -> generic -> numbered -> ERI/challenge', () => {
    const facultySpecific = createCourse('faculty', ['KK-RUMALU']) // mentoring code -> treated as mandatory
    const generic = createCourse('generic', ['KK-RUKAIKKI'])
    const numbered = createCourse('numbered', ['KK-RUO205'])
    const eri = createCourse('eri', ['KK-RUERI'])

    const input = [numbered, eri, generic, facultySpecific]

    const ordered = sortCourseData(input, 'sv-secondary')

    const ids = ordered.map(c => c.id)

    expect(ids[0]).toBe('faculty')
    expect(ids[1]).toBe('generic')
    expect(ids[2]).toBe('numbered')
    expect(ids[3]).toBe('eri')
  })

  it('sorts exam courses to the bottom, below the ERI/challenge tier', () => {
    const eri = createCourse('eri', ['KK-RUERI'])
    const exam = createCourse('exam', ['KK-RUO205'], 'Kurssin tentti')

    const ordered = sortCourseData([exam, eri], 'sv-secondary')

    const ids = ordered.map(c => c.id)

    expect(ids[0]).toBe('eri')
    expect(ids[1]).toBe('exam')
  })
})
