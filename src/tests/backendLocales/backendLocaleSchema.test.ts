import { describe, expect, it } from 'vitest'

import { BackendLocaleKeySchema, BackendLocaleValueSchema, specificationCanBeMatched } from '../../common/validators.ts'

const text = { fi: 'fi', sv: 'sv', en: 'en' }

describe('BackendLocaleKeySchema', () => {
  it('accepts a dotted key', () => {
    const parsed = BackendLocaleKeySchema.safeParse({
      key: 'noRecommendations.additionalInfo',
      description: 'Shown under the empty state',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects a key with spaces', () => {
    const parsed = BackendLocaleKeySchema.safeParse({ key: 'has spaces', description: 'x' })
    expect(parsed.success).toBe(false)
  })

  it('rejects a key with a slash', () => {
    const parsed = BackendLocaleKeySchema.safeParse({ key: 'has/slash', description: 'x' })
    expect(parsed.success).toBe(false)
  })

  it('rejects an empty description', () => {
    const parsed = BackendLocaleKeySchema.safeParse({ key: 'valid.key', description: '   ' })
    expect(parsed.success).toBe(false)
  })
})

describe('specificationCanBeMatched', () => {
  it('is false for english courses', () => {
    expect(specificationCanBeMatched('en', null)).toBe(false)
  })

  it('is false when the course language differs from the language of education', () => {
    expect(specificationCanBeMatched('sv', 'fi')).toBe(false)
  })

  it('is true when the languages match', () => {
    expect(specificationCanBeMatched('sv', 'sv')).toBe(true)
  })

  it('is true while either language is still a wildcard', () => {
    expect(specificationCanBeMatched(null, 'fi')).toBe(true)
    expect(specificationCanBeMatched('fi', null)).toBe(true)
  })
})

describe('BackendLocaleValueSchema', () => {
  it('defaults every dimension to a wildcard', () => {
    const parsed = BackendLocaleValueSchema.parse({ text })
    expect(parsed.organisationCode).toBeNull()
    expect(parsed.lang).toBeNull()
    expect(parsed.primaryLanguage).toBeNull()
    expect(parsed.primaryLanguageSpecification).toBeNull()
  })

  it('accepts a specification when the languages match', () => {
    const parsed = BackendLocaleValueSchema.safeParse({
      lang: 'sv',
      primaryLanguage: 'sv',
      primaryLanguageSpecification: 'written',
      text,
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects a specification on an english course', () => {
    const parsed = BackendLocaleValueSchema.safeParse({
      lang: 'en',
      primaryLanguageSpecification: 'written',
      text,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects a specification when the languages differ', () => {
    const parsed = BackendLocaleValueSchema.safeParse({
      lang: 'sv',
      primaryLanguage: 'fi',
      primaryLanguageSpecification: 'spoken',
      text,
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects an unknown language', () => {
    expect(BackendLocaleValueSchema.safeParse({ lang: 'de', text }).success).toBe(false)
  })

  it('rejects english as a language of education', () => {
    expect(BackendLocaleValueSchema.safeParse({ primaryLanguage: 'en', text }).success).toBe(false)
  })
})
