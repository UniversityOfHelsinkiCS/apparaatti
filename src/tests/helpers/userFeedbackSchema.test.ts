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

  it('rejects empty text feedback', () => {
    expect(() => UserFeedbackSchema.parse({ textFeedback: '   ', stars: 2 })).toThrow()
  })

  it('rejects stars outside 0-5', () => {
    expect(() => UserFeedbackSchema.parse({ textFeedback: 'ok', stars: -1 })).toThrow()
    expect(() => UserFeedbackSchema.parse({ textFeedback: 'ok', stars: 6 })).toThrow()
  })
})
