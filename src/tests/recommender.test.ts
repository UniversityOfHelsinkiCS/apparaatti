import { describe, it, expect, vi } from 'vitest'
import recommendCourses from '../server/util/recommender'

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

})
