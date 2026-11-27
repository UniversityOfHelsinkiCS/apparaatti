import { describe, expect, it } from 'vitest'

import { shouldRenderWelcomeFilter, shouldResetFilter } from '../../client/contexts/filter/filterRules'
import type { Variant } from '../../common/types'

const SPEC_FILTER = 'primary-language-specification'

const variant = (fields: Partial<Variant> = {}): Variant => ({
  name: 'default',
  organisationCode: null,
  lang: null,
  primaryLanguage: null,
  primaryLanguageSpecification: null,
  question: 'Q',
  ...fields,
})

describe('shouldRenderWelcomeFilter', () => {
  it('hides a filter whose resolved variant is skipped', () => {
    expect(shouldRenderWelcomeFilter('study-year', variant({ skipped: true }), 'fi', 'fi')).toBe(false)
  })

  it('hides a filter that resolved to no variant at all', () => {
    expect(shouldRenderWelcomeFilter('study-year', undefined, 'fi', 'fi')).toBe(false)
  })

  it('shows the specification filter only when the studied language is the primary one', () => {
    expect(shouldRenderWelcomeFilter(SPEC_FILTER, variant(), 'fi', 'fi')).toBe(true)
    expect(shouldRenderWelcomeFilter(SPEC_FILTER, variant(), 'sv', 'sv')).toBe(true)
  })

  it('hides the specification filter when the studied language is not the primary one', () => {
    expect(shouldRenderWelcomeFilter(SPEC_FILTER, variant(), 'sv', 'fi')).toBe(false)
  })

  it('hides the specification filter for english even when english is the primary language', () => {
    expect(shouldRenderWelcomeFilter(SPEC_FILTER, variant(), 'en', 'en')).toBe(false)
  })

  it('hides the specification filter before a language has been chosen', () => {
    expect(shouldRenderWelcomeFilter(SPEC_FILTER, variant(), '', '')).toBe(false)
  })

  it('applies that rule to the specification filter alone', () => {
    expect(shouldRenderWelcomeFilter('study-year', variant(), 'en', 'en')).toBe(true)
    expect(shouldRenderWelcomeFilter('study-year', variant(), '', '')).toBe(true)
  })
})

describe('shouldResetFilter', () => {
  it('keeps the answers to the welcome modal questions', () => {
    expect(shouldResetFilter({ id: 'study-year', showInWelcomeModal: true })).toBe(false)
  })

  it('resets a filter that is not asked in the welcome modal', () => {
    expect(shouldResetFilter({ id: 'study-place', showInWelcomeModal: false })).toBe(true)
  })

  it('resets the specification filter even though the welcome modal asks it', () => {
    expect(shouldResetFilter({ id: SPEC_FILTER, showInWelcomeModal: true })).toBe(true)
  })
})
