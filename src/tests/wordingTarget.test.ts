import { describe, expect, it } from 'vitest'

import {
  describePickedTarget,
  hasSharedFallback,
  textForVariant,
  wordingMutations,
} from '../client/components/editMode/wordingMutations'
import type { EditTarget } from '../client/contexts/filterEditModeContext'
import type { FilterVariant } from '../common/types'

const variant = (name: string, conditions: Partial<FilterVariant> = {}): FilterVariant => ({
  name,
  organisationCode: null,
  lang: null,
  primaryLanguage: null,
  primaryLanguageSpecification: null,
  question: { fi: '', sv: '', en: '' },
  ...conditions,
})

const variants = [
  variant('default'),
  variant('sv-fi-H3456', { lang: 'sv', primaryLanguage: 'fi', organisationCode: 'H3456' }),
]

const labels = {
  defaultLabel: 'Yleinen oletusteksti',
  sharedLabel: 'Yhteinen kaikille varianteille',
  newVariant: (key: string) => `Uusi variantti: ${key}`,
}

const text = { fi: 'Kysymys', sv: 'Fråga', en: 'Question' }

const target = (overrides: Partial<EditTarget> = {}): EditTarget => ({
  filterId: 'lang',
  field: 'question',
  optionId: null,
  variantName: 'default',
  isFallbackVariant: true,
  variantQuery: { organisationCode: '', lang: 'sv', primaryLanguage: 'fi', primaryLanguageSpecification: '' },
  filterVariants: variants,
  current: text,
  filterText: null,
  anchor: {} as HTMLElement,
  ...overrides,
})

describe('describePickedTarget', () => {
  it('labels the catch-all variant as the default text', () => {
    expect(describePickedTarget({ mode: 'existing', variantName: 'default' }, variants, labels)).toBe(
      'Yleinen oletusteksti'
    )
  })

  it('describes a specific variant by its conditions', () => {
    expect(describePickedTarget({ mode: 'existing', variantName: 'sv-fi-H3456' }, variants, labels)).toBe('sv-fi-H3456')
  })

  it('labels a variant still to be created', () => {
    const conditions = { organisationCode: null, lang: 'sv', primaryLanguage: 'fi', primaryLanguageSpecification: null }
    expect(describePickedTarget({ mode: 'new', conditions }, variants, labels)).toBe('Uusi variantti: sv-fi')
  })

  it('falls back to the variant name when the variant is unknown', () => {
    expect(describePickedTarget({ mode: 'existing', variantName: 'gone' }, variants, labels)).toBe('gone')
  })

  it('labels the filter-wide fallback as shared', () => {
    expect(describePickedTarget({ mode: 'filter' }, variants, labels)).toBe('Yhteinen kaikille varianteille')
  })
})

describe('hasSharedFallback', () => {
  it('is true for the three texts with a filter-wide fallback', () => {
    expect(hasSharedFallback('explanation')).toBe(true)
    expect(hasSharedFallback('variantShortName')).toBe(true)
    expect(hasSharedFallback('variantExtraInfo')).toBe(true)
  })

  it('is false for texts that live only on the variant', () => {
    expect(hasSharedFallback('question')).toBe(false)
    expect(hasSharedFallback('option')).toBe(false)
  })
})

describe('textForVariant', () => {
  const filterText = { fi: 'Yhteinen', sv: 'Gemensam', en: 'Shared' }

  it('seeds the shared text for a variant with no override', () => {
    const noOverride = variant('sv-fi-H3456')
    expect(textForVariant(target({ field: 'variantShortName', filterText }), noOverride)).toEqual(filterText)
    expect(textForVariant(target({ field: 'variantExtraInfo', filterText }), noOverride)).toEqual(filterText)
    expect(textForVariant(target({ field: 'explanation', filterText }), noOverride)).toEqual(filterText)
  })

  it('prefers the variant override over the shared text', () => {
    const own = { fi: 'Oma', sv: 'Egen', en: 'Own' }
    const withOverride = variant('sv-fi-H3456', { shortName: own })
    expect(textForVariant(target({ field: 'variantShortName', filterText }), withOverride)).toEqual(own)
  })
})

describe('wordingMutations', () => {
  it('writes the text to the picked existing variant', () => {
    expect(wordingMutations(target(), text, { mode: 'existing', variantName: 'sv-fi-H3456' })).toEqual({
      wordings: [{ op: 'variantQuestion', filterId: 'lang', variantName: 'sv-fi-H3456', text }],
      settings: [],
    })
  })

  it('creates a new variant from the edited one and writes the text to it', () => {
    const conditions = { organisationCode: null, lang: 'sv', primaryLanguage: 'fi', primaryLanguageSpecification: null }
    expect(wordingMutations(target(), text, { mode: 'new', conditions })).toEqual({
      wordings: [
        { op: 'createVariant', filterId: 'lang', variantName: 'sv-fi', fromVariantName: 'default', ...conditions },
        { op: 'variantQuestion', filterId: 'lang', variantName: 'sv-fi', text },
      ],
      settings: [],
    })
  })

  it('writes filter-wide fields without a variant', () => {
    expect(wordingMutations(target({ field: 'shortName' }), text, { mode: 'filter' })).toEqual({
      wordings: [{ op: 'shortName', filterId: 'lang', text }],
      settings: [],
    })
  })

  it('sends a per-variant field to the shared fallback when that target is picked', () => {
    expect(wordingMutations(target({ field: 'variantShortName' }), text, { mode: 'filter' })).toEqual({
      wordings: [{ op: 'shortName', filterId: 'lang', text }],
      settings: [],
    })
  })

  it('clears a variant override with a null text', () => {
    expect(
      wordingMutations(target({ field: 'variantExtraInfo' }), null, { mode: 'existing', variantName: 'sv-fi-H3456' })
    ).toEqual({
      wordings: [{ op: 'variantExtraInfo', filterId: 'lang', variantName: 'sv-fi-H3456', text: null }],
      settings: [],
    })
  })
})
