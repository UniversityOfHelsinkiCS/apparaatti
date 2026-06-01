import { describe, expect, it } from 'vitest'
import { UserFeedbackSchema } from '../../common/validators'

describe('UserFeedbackSchema', () => {
  it('accepts valid feedback', () => {
    const parsed = UserFeedbackSchema.parse({
      textFeedback: 'Great app',
      stars: 5,
    })

    expect(parsed.textFeedback).toBe('Great app')
    expect(parsed.stars).toBe(5)
  })

  it('accepts optional recommendation metadata', () => {
    const parsed = UserFeedbackSchema.parse({
      textFeedback: 'Great app',
      stars: 4,
      recommendationMetadata: {
        answerData: { language: 'fi' },
        recommendations: [{ id: 'TEST-CUR' }],
      },
    })

    expect(parsed.recommendationMetadata).toBeDefined()
  })

  it('rejects empty text feedback', () => {
    expect(() => UserFeedbackSchema.parse({ textFeedback: '   ', stars: 2 })).toThrow()
  })

  it('rejects stars outside 0-5', () => {
    expect(() => UserFeedbackSchema.parse({ textFeedback: 'ok', stars: -1 })).toThrow()
    expect(() => UserFeedbackSchema.parse({ textFeedback: 'ok', stars: 6 })).toThrow()
  })

  it('rejects non-object recommendation metadata', () => {
    expect(() =>
      UserFeedbackSchema.parse({
        textFeedback: 'ok',
        stars: 3,
        recommendationMetadata: 'metadata',
      })
    ).toThrow()
  })
})
