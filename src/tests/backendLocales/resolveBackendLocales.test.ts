import { describe, expect, it } from 'vitest'

import type { BackendLocaleContext, BackendLocaleKey, BackendLocaleValue } from '../../common/types.ts'
import {
  isMoreSpecific,
  matchesContext,
  resolveBackendLocales,
  resolveValue,
} from '../../server/util/backendLocales.ts'

type Conditions = Partial<
  Pick<BackendLocaleValue, 'organisationCode' | 'lang' | 'primaryLanguage' | 'primaryLanguageSpecification'>
>

let nextId = 1

const value = (conditions: Conditions, text = 'text'): BackendLocaleValue => ({
  id: nextId++,
  key: 'a.key',
  organisationCode: conditions.organisationCode ?? null,
  lang: conditions.lang ?? null,
  primaryLanguage: conditions.primaryLanguage ?? null,
  primaryLanguageSpecification: conditions.primaryLanguageSpecification ?? null,
  text: { fi: text, sv: text, en: text },
})

const context = (overrides: Partial<BackendLocaleContext> = {}): BackendLocaleContext => ({
  organisationCode: 'H50',
  lang: 'sv',
  primaryLanguage: 'sv',
  primaryLanguageSpecification: 'written',
  ...overrides,
})

const key = (values: BackendLocaleValue[], name = 'a.key'): BackendLocaleKey => ({
  id: 1,
  key: name,
  description: 'a description',
  values: values.map(v => ({ ...v, key: name })),
})

describe('matchesContext', () => {
  it('matches a value whose conditions are all wildcards', () => {
    expect(matchesContext(value({}), context())).toBe(true)
  })

  it('matches a value whose set conditions all equal the context', () => {
    expect(matchesContext(value({ organisationCode: 'H50', lang: 'sv' }), context())).toBe(true)
  })

  it('does not match a value for another organisation', () => {
    expect(matchesContext(value({ organisationCode: 'H55' }), context())).toBe(false)
  })

  it('does not match a value whose specification differs', () => {
    expect(matchesContext(value({ primaryLanguageSpecification: 'spoken' }), context())).toBe(false)
  })

  it('matches only wildcards when the context condition is unanswered', () => {
    const emptyContext = context({ organisationCode: '' })
    expect(matchesContext(value({}), emptyContext)).toBe(true)
    expect(matchesContext(value({ organisationCode: 'H50' }), emptyContext)).toBe(false)
  })
})

describe('isMoreSpecific', () => {
  const allCombinations = () => {
    const combinations: Conditions[] = []
    for (const organisationCode of [null, 'H50']) {
      for (const lang of [null, 'sv']) {
        for (const primaryLanguage of [null, 'sv']) {
          for (const primaryLanguageSpecification of [null, 'written']) {
            combinations.push({
              organisationCode: organisationCode ?? undefined,
              lang: lang ?? undefined,
              primaryLanguage: primaryLanguage ?? undefined,
              primaryLanguageSpecification: primaryLanguageSpecification ?? undefined,
            })
          }
        }
      }
    }
    return combinations.map(conditions => value(conditions))
  }

  it('ranks an organisation above every combination of the lower conditions', () => {
    const organisationOnly = value({ organisationCode: 'H50' })
    const everythingElse = value({ lang: 'sv', primaryLanguage: 'sv', primaryLanguageSpecification: 'written' })
    expect(isMoreSpecific(organisationOnly, everythingElse)).toBe(true)
    expect(isMoreSpecific(everythingElse, organisationOnly)).toBe(false)
  })

  it('ranks lang above primaryLanguage when each is the only condition set', () => {
    expect(isMoreSpecific(value({ lang: 'sv' }), value({ primaryLanguage: 'sv' }))).toBe(true)
    expect(isMoreSpecific(value({ primaryLanguage: 'sv' }), value({ lang: 'sv' }))).toBe(false)
  })

  it('ranks a fully specified value above an all-wildcard value', () => {
    const specific = value({
      organisationCode: 'H50',
      lang: 'sv',
      primaryLanguage: 'sv',
      primaryLanguageSpecification: 'written',
    })
    expect(isMoreSpecific(specific, value({}))).toBe(true)
  })

  it('is antisymmetric across all 16 wildcard combinations', () => {
    const combinations = allCombinations()
    for (const a of combinations) {
      for (const b of combinations) {
        if (a === b) continue
        expect(isMoreSpecific(a, b) && isMoreSpecific(b, a)).toBe(false)
      }
    }
  })

  it('never reports a combination as more specific than itself', () => {
    for (const combination of allCombinations()) {
      expect(isMoreSpecific(combination, combination)).toBe(false)
    }
  })
})

describe('resolveValue', () => {
  it('returns null when nothing matches', () => {
    expect(resolveValue([value({ organisationCode: 'H55' })], context())).toBeNull()
  })

  it('returns null when there are no values at all', () => {
    expect(resolveValue([], context())).toBeNull()
  })

  it('prefers the organisation-specific value over the catch-all', () => {
    const catchAll = value({}, 'catch-all')
    const organisationSpecific = value({ organisationCode: 'H50' }, 'faculty')
    expect(resolveValue([catchAll, organisationSpecific], context())?.text.fi).toBe('faculty')
  })

  it('prefers the organisation-and-language value over the organisation-only value', () => {
    const organisationOnly = value({ organisationCode: 'H50' }, 'faculty')
    const withLanguage = value({ organisationCode: 'H50', lang: 'sv' }, 'faculty and language')
    expect(resolveValue([organisationOnly, withLanguage], context())?.text.fi).toBe('faculty and language')
  })

  it('falls back to the catch-all for an organisation with no value of its own', () => {
    const catchAll = value({}, 'catch-all')
    const otherFaculty = value({ organisationCode: 'H55' }, 'other faculty')
    const resolved = resolveValue([catchAll, otherFaculty], context({ organisationCode: 'H90' }))
    expect(resolved?.text.fi).toBe('catch-all')
  })

  it('resolves the same value regardless of input order', () => {
    const values = [
      value({}, 'catch-all'),
      value({ organisationCode: 'H50' }, 'faculty'),
      value({ lang: 'sv' }, 'language'),
      value({ organisationCode: 'H50', lang: 'sv' }, 'both'),
    ]
    const forwards = resolveValue(values, context())
    const backwards = resolveValue([...values].reverse(), context())
    expect(forwards?.text.fi).toBe('both')
    expect(backwards?.text.fi).toBe('both')
  })
})

describe('resolveBackendLocales', () => {
  it('emits an entry for every key, null when unmatched', () => {
    const matched = key([value({}, 'shown')], 'matched.key')
    const unmatched = key([value({ organisationCode: 'H55' })], 'unmatched.key')

    const resolved = resolveBackendLocales([matched, unmatched], context())

    expect(Object.keys(resolved).sort()).toEqual(['matched.key', 'unmatched.key'])
    expect(resolved['matched.key']?.fi).toBe('shown')
    expect(resolved['unmatched.key']).toBeNull()
  })

  it('emits null for a key that has no values at all', () => {
    const resolved = resolveBackendLocales([key([], 'empty.key')], context())
    expect(resolved['empty.key']).toBeNull()
  })

  it('does not leak values from one key into another', () => {
    const withValue = key([value({}, 'mine')], 'has.value')
    const withoutValue = key([], 'has.none')

    const resolved = resolveBackendLocales([withValue, withoutValue], context())

    expect(resolved['has.value']?.fi).toBe('mine')
    expect(resolved['has.none']).toBeNull()
  })

  it('returns an empty map when there are no keys', () => {
    expect(resolveBackendLocales([], context())).toEqual({})
  })
})
