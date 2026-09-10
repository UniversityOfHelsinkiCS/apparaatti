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
  it('accepts a language that matches every languageType and specification', () => {
    expect(RecommendationLanguageSchema.safeParse(language()).success).toBe(true)
  })

  it('accepts primary and secondary as the languageType', () => {
    expect(RecommendationLanguageSchema.safeParse(language({ lang: 'fi', languageType: 'primary' })).success).toBe(true)
    expect(RecommendationLanguageSchema.safeParse(language({ lang: 'fi', languageType: 'secondary' })).success).toBe(
      true
    )
  })

  it('accepts spoken and written as the specification', () => {
    expect(RecommendationLanguageSchema.safeParse(language({ primaryLanguageSpecification: 'spoken' })).success).toBe(
      true
    )
    expect(RecommendationLanguageSchema.safeParse(language({ primaryLanguageSpecification: 'written' })).success).toBe(
      true
    )
  })

  it('rejects writtenAndSpoken as a specification because it is a user answer, not a property of a course', () => {
    expect(
      RecommendationLanguageSchema.safeParse(language({ primaryLanguageSpecification: 'writtenAndSpoken' })).success
    ).toBe(false)
  })

  it('defaults languageType and specification to null', () => {
    const parsed = RecommendationLanguageSchema.parse({ name, lang: 'fi' })

    expect(parsed.languageType).toBe(null)
    expect(parsed.primaryLanguageSpecification).toBe(null)
  })

  it('rejects an unknown language', () => {
    expect(RecommendationLanguageSchema.safeParse(language({ lang: 'de' })).success).toBe(false)
  })

  it('rejects a name that is missing a translation', () => {
    expect(RecommendationLanguageSchema.safeParse(language({ name: { fi: 'Englanti' } })).success).toBe(false)
  })
})

describe('RecommendationCodeSchema', () => {
  it('accepts a code for a known organisation', () => {
    expect(RecommendationCodeSchema.safeParse(code()).success).toBe(true)
  })

  it('accepts a course code containing a slash', () => {
    expect(RecommendationCodeSchema.safeParse(code({ courseCode: 'KK-ENKAIKKI1/2' })).success).toBe(true)
  })

  it('accepts a numeric organisation code', () => {
    expect(RecommendationCodeSchema.safeParse(code({ organisationCode: '4141' })).success).toBe(true)
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

  it('rejects an empty course code', () => {
    expect(RecommendationCodeSchema.safeParse(code({ courseCode: '' })).success).toBe(false)
  })

  it('rejects a languageId that is not a positive integer', () => {
    expect(RecommendationCodeSchema.safeParse(code({ languageId: 0 })).success).toBe(false)
    expect(RecommendationCodeSchema.safeParse(code({ languageId: 1.5 })).success).toBe(false)
  })
})
