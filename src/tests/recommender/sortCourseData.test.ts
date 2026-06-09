import { describe, it, expect, vi } from 'vitest'

vi.mock('../../server/util/dbActions.ts', () => ({
  curcusWithUnitIdOf: vi.fn(),
  curWithIdOf: vi.fn(),
  cuWithCourseCodeOf: vi.fn(),
  organisationWithGroupIdOf: vi.fn(),
}))

import { sortCourseData } from '../../server/util/recommender.ts'
import type { CourseData } from '../../common/types.ts'

function createCourse(id: string, courseCodes: string[]): CourseData {
  const now = new Date()
  return {
    id,
    name: { fi: id },
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
    const facultySpecific = createCourse('faculty', ['KK-ENG301']) // mentoring code -> treated as mandatory
    const generic = createCourse('generic', ['KAIKKI'])
    const numbered = createCourse('numbered', ['ENG-201'])
    const eri = createCourse('eri', ['KK-ENERI'])

    const input = [numbered, eri, generic, facultySpecific]

    const ordered = sortCourseData(input, 'en-primary')

    const ids = ordered.map(c => c.id)

    expect(ids[0]).toBe('faculty')
    expect(ids[1]).toBe('generic')
    expect(ids[2]).toBe('numbered')
    expect(ids[3]).toBe('eri')
  })
})
