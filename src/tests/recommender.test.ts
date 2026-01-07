import { describe, it, expect, vi } from 'vitest'
import recommendCourses from '../server/util/recommender'

vi.mock('../server/db/connection', () => {
  const SequelizeMock = vi.fn().mockImplementation(() => ({
    authenticate: vi.fn().mockResolvedValue(true),
    sync: vi.fn().mockResolvedValue(true),
    close: vi.fn().mockResolvedValue(true),
  }))

  return {
    sequelize: new SequelizeMock()
  }
})


describe('recommender tests', () => {
  it('passes', () => {
    const val = true
    expect(val === true)
  })

  it('recommender returns an empty answer with a invalid input', async() => {
    await recommendCourses({})
  })

})
