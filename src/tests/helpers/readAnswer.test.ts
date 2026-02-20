import { describe, expect, it, vi } from 'vitest'

vi.mock('../../server/util/organisationCourseRecommmendations.ts', () => ({
  courseHasCustomCodeUrn: vi.fn(),
  courseHasAnyOfCodes: vi.fn(),
  courseHasAnyRealisationCodeUrn: vi.fn(),
}))

vi.mock('../../server/util/dbActions.ts', () => ({
  organisationWithGroupIdOf: vi.fn(),
}))

import type { AnswerData } from '../../common/types.ts'
import { readAnswer } from '../../server/util/recommender.ts'

const createAnswerData = (overrides: Partial<AnswerData> = {}): AnswerData => ({
  'study-year': 'neutral',
  'study-period': 'neutral',
  'graduation': 'neutral',
  'mentoring': 'neutral',
  'integrated': 'neutral',
  'study-place': 'neutral',
  'replacement': 'neutral',
  'challenge': 'neutral',
  'independent': 'neutral',
  'flexible': 'neutral',
  'mooc': 'neutral',
  'study-field-select': 'neutral',
  'lang': 'neutral',
  'primary-language': 'neutral',
  'primary-language-specification': 'neutral',
  'multi-period': 'neutral',
  ...overrides,
})

describe('readAnswer', () => {
  it('returns existing value for key', () => {
    const data = createAnswerData({ 'graduation': '1' })
    expect(readAnswer(data, 'graduation')).toBe('1')
  })

  it('returns neutral for missing key', () => {
    const data = createAnswerData()
    expect(readAnswer(data, 'nonexistent' as any)).toBe('neutral')
  })

  it('returns neutral for falsy/empty value', () => {
    const data = createAnswerData({ 'graduation': '' as any })
    expect(readAnswer(data, 'graduation')).toBe('neutral')
  })
})
