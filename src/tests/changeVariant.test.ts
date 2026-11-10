import { describe, expect, it } from 'vitest'

import {
  describeFilterVariant,
  normalizeVariantQuery,
  queryForVariant,
} from '../client/components/editMode/changeVariant'
import { describeVariantQuery, type VariantQuery } from '../common/conditionMatching'
import type { FilterVariant } from '../common/types'

const variant = (conditions: Partial<FilterVariant>): FilterVariant => ({
  name: 'v',
  organisationCode: null,
  lang: null,
  primaryLanguage: null,
  primaryLanguageSpecification: null,
  question: { fi: '', sv: '', en: '' },
  ...conditions,
})

const current: VariantQuery = {
  organisationCode: 'H3456',
  lang: 'fi',
  primaryLanguage: 'fi',
  primaryLanguageSpecification: 'written',
}

describe('normalizeVariantQuery', () => {
  it('keeps the specification when course language equals school language', () => {
    expect(normalizeVariantQuery(current)).toEqual(current)
  })

  it('clears the specification when languages differ', () => {
    expect(normalizeVariantQuery({ ...current, lang: 'sv' }).primaryLanguageSpecification).toBe('')
  })

  it('clears the specification for English', () => {
    expect(normalizeVariantQuery({ ...current, lang: 'en', primaryLanguage: 'en' }).primaryLanguageSpecification).toBe(
      ''
    )
  })

  it('clears the specification when the course language is unanswered', () => {
    expect(normalizeVariantQuery({ ...current, lang: '' }).primaryLanguageSpecification).toBe('')
  })
})

describe('queryForVariant', () => {
  it('uses the variant conditions and keeps current answers for open conditions', () => {
    expect(queryForVariant(variant({ lang: 'sv', primaryLanguage: 'fi' }), current)).toEqual({
      organisationCode: 'H3456',
      lang: 'sv',
      primaryLanguage: 'fi',
      primaryLanguageSpecification: '',
    })
  })

  it('takes an organisation-specific variant organisation', () => {
    expect(queryForVariant(variant({ organisationCode: 'H1000' }), current).organisationCode).toBe('H1000')
  })

  it('keeps everything for the catch-all variant', () => {
    expect(queryForVariant(variant({}), current)).toEqual(current)
  })

  it('keeps an "any" faculty empty when the variant has no organisation condition', () => {
    const anyFaculty = { ...current, organisationCode: '' }
    expect(queryForVariant(variant({ lang: 'sv', primaryLanguage: 'fi' }), anyFaculty).organisationCode).toBe('')
  })
})

describe('describeVariantQuery with an "any" faculty', () => {
  it('leaves the organisation code out of the variant key', () => {
    expect(
      describeVariantQuery({
        organisationCode: '',
        lang: 'sv',
        primaryLanguage: 'fi',
        primaryLanguageSpecification: '',
      })
    ).toBe('sv-fi')
  })
})

describe('describeFilterVariant', () => {
  it('labels the catch-all variant with the default label', () => {
    expect(describeFilterVariant(variant({}), 'Oletus')).toBe('Oletus')
  })

  it('describes a specific variant by its conditions', () => {
    expect(describeFilterVariant(variant({ lang: 'sv', primaryLanguage: 'fi', organisationCode: 'H3456' }), 'x')).toBe(
      'sv-fi-H3456'
    )
  })
})
