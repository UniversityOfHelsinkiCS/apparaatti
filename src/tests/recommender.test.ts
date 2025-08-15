import { describe, it, expect } from 'vitest'
import recommendCourses from '../server/util/recommender'
import { CourseRecommendations } from '../common/types'

describe('recommender tests', () => {
  it('passes', () => {
    const val = true
    expect(val === true)
  })

  it('recommender returns an empty answer with a invalid input', async() => {
    const result: CourseRecommendations = await recommendCourses({})

  })

})
