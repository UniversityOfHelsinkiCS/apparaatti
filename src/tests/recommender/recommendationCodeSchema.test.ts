import { describe, expect, it } from 'vitest'

import { RecommendationCodeSchema, RecommendationLanguageSchema } from '../../common/validators.ts'

const name = { fi: 'Englanti', en: 'English', sv: 'Engelska' }

const language = (overrides: Record<string, unknown> = {}) => ({
  name,
  lang: 'en',
  languageType: null,
  primaryLanguageSpecification: null,
  ...overrides,
})

const code = (overrides: Record<string, unknown> = {}) => ({
  organisationCode: 'H57',
  languageId: 1,
  courseCode: 'KK-ENERI',
  ...overrides,
})

describe('RecommendationLanguageSchema', () => {
  it('accepts a valid language', () => {
    expect(RecommendationLanguageSchema.safeParse(language()).success).toBe(true)
  })

  it('rejects writtenAndSpoken as a specification because it is a user answer, not a property of a course', () => {
    expect(
      RecommendationLanguageSchema.safeParse(language({ primaryLanguageSpecification: 'writtenAndSpoken' })).success
    ).toBe(false)
  })
})

describe('RecommendationCodeSchema', () => {
  it('accepts a valid code', () => {
    expect(RecommendationCodeSchema.safeParse(code()).success).toBe(true)
  })

  it('accepts a course code containing a slash', () => {
    expect(RecommendationCodeSchema.safeParse(code({ courseCode: 'KK-ENKAIKKI1/2' })).success).toBe(true)
  })

  it('rejects an unknown organisation', () => {
    expect(RecommendationCodeSchema.safeParse(code({ organisationCode: 'H99' })).success).toBe(false)
  })

  it('rejects a course code with whitespace inside it', () => {
    expect(RecommendationCodeSchema.safeParse(code({ courseCode: 'KK ENERI' })).success).toBe(false)
  })

  it('trims surrounding whitespace from the course code', () => {
    expect(RecommendationCodeSchema.parse(code({ courseCode: '  KK-ENERI  ' })).courseCode).toBe('KK-ENERI')
  })
})
