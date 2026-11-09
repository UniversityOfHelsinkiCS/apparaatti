import { describe, expect, it } from 'vitest'

import { resolveVariant } from '../client/hooks/useQuestions'
import type { Question, Variant } from '../common/types'

const variant = (fields: Partial<Variant>): Variant => ({
  name: 'v',
  organisationCode: null,
  lang: null,
  primaryLanguage: null,
  primaryLanguageSpecification: null,
  question: 'Q',
  ...fields,
})

const question = (variants: Variant[]): Question => ({
  id: 'q',
  variants,
})

describe('resolveVariant', () => {
  it('prefers a more specific variant over a wildcard one declared earlier', () => {
    // Regression test: the old variantLookUp Map returned the first matching entry in
    // insertion order, so a wildcard declared before a more specific entry shadowed it.
    // resolveVariant must pick by specificity regardless of array order.
    const wildcard = variant({ name: 'fi_unknown', lang: 'fi', primaryLanguage: 'fi', question: 'wildcard' })
    const specific = variant({
      name: 'fi_primary_written',
      lang: 'fi',
      primaryLanguage: 'fi',
      primaryLanguageSpecification: 'written',
      question: 'specific',
    })

    const q = question([wildcard, specific])
    const context = { organisationCode: '', lang: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: 'written' }

    const { variant: resolved, isFallback } = resolveVariant(q, context)
    expect(resolved?.question).toBe('specific')
    expect(isFallback).toBe(false)
  })

  it('falls back to the catch-all variant when nothing matches', () => {
    const catchAll = variant({ name: 'default', question: 'fallback' })
    const svOnly = variant({ name: 'sv_unknown', lang: 'sv', question: 'sv' })

    const q = question([catchAll, svOnly])
    const context = { organisationCode: '', lang: 'fi', primaryLanguage: '', primaryLanguageSpecification: '' }

    const { variant: resolved, isFallback } = resolveVariant(q, context)
    expect(resolved?.question).toBe('fallback')
    expect(isFallback).toBe(true)
  })

  it('prefers a faculty-specific variant over a language-only match', () => {
    const languageOnly = variant({ name: 'fi_unknown', lang: 'fi', question: 'language-only' })
    const facultySpecific = variant({
      name: 'fi_h50',
      organisationCode: 'H50',
      lang: 'fi',
      question: 'faculty-specific',
    })

    const q = question([languageOnly, facultySpecific])
    const context = { organisationCode: 'H50', lang: 'fi', primaryLanguage: '', primaryLanguageSpecification: '' }

    const { variant: resolved } = resolveVariant(q, context)
    expect(resolved?.question).toBe('faculty-specific')
  })
})
