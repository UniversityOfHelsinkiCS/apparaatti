import { describe, expect, it } from 'vitest'

import {
  emptyValueDraft,
  hasCatchAllValue,
  isCatchAll,
  toPayload,
  toValueDraft,
} from '../../client/components/admin/backendLocaleEdit/backendLocaleUtils.ts'
import type { BackendLocaleKey, BackendLocaleValue } from '../../common/types.ts'

const text = { fi: 'fi', sv: 'sv', en: 'en' }

const value = (dimensions: Partial<BackendLocaleValue> = {}): BackendLocaleValue => ({
  id: 1,
  key: 'a.key',
  organisationCode: null,
  lang: null,
  primaryLanguage: null,
  primaryLanguageSpecification: null,
  text,
  ...dimensions,
})

const key = (values: BackendLocaleValue[]): BackendLocaleKey => ({
  id: 1,
  key: 'a.key',
  description: 'a description',
  values,
})

describe('toPayload', () => {
  it('maps every empty dimension to a wildcard', () => {
    const payload = toPayload(emptyValueDraft())
    expect(payload.organisationCode).toBeNull()
    expect(payload.lang).toBeNull()
    expect(payload.primaryLanguage).toBeNull()
    expect(payload.primaryLanguageSpecification).toBeNull()
  })

  it('preserves the dimensions that are set', () => {
    const payload = toPayload({
      organisationCode: 'H50',
      lang: 'sv',
      primaryLanguage: 'sv',
      primaryLanguageSpecification: 'written',
      text,
    })
    expect(payload.organisationCode).toBe('H50')
    expect(payload.lang).toBe('sv')
    expect(payload.primaryLanguage).toBe('sv')
    expect(payload.primaryLanguageSpecification).toBe('written')
  })

  it('round-trips a stored value through the draft form', () => {
    const stored = value({ organisationCode: 'H50', lang: 'sv' })
    const payload = toPayload(toValueDraft(stored))
    expect(payload.organisationCode).toBe('H50')
    expect(payload.lang).toBe('sv')
    expect(payload.primaryLanguage).toBeNull()
  })
})

describe('isCatchAll', () => {
  it('is true only when every dimension is a wildcard', () => {
    expect(isCatchAll(value())).toBe(true)
  })

  it('is false when any single dimension is set', () => {
    expect(isCatchAll(value({ organisationCode: 'H50' }))).toBe(false)
    expect(isCatchAll(value({ lang: 'sv' }))).toBe(false)
    expect(isCatchAll(value({ primaryLanguage: 'sv' }))).toBe(false)
    expect(isCatchAll(value({ primaryLanguageSpecification: 'written' }))).toBe(false)
  })
})

describe('hasCatchAllValue', () => {
  it('is false for a key with no values', () => {
    expect(hasCatchAllValue(key([]))).toBe(false)
  })

  it('is false when every value targets something specific', () => {
    expect(hasCatchAllValue(key([value({ organisationCode: 'H50' }), value({ lang: 'sv' })]))).toBe(false)
  })

  it('is true when one of the values is a catch-all', () => {
    expect(hasCatchAllValue(key([value({ organisationCode: 'H50' }), value()]))).toBe(true)
  })
})
