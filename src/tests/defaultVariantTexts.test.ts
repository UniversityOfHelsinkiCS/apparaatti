import { describe, expect, it } from 'vitest'

import { withDefaultTexts } from '../server/db/migrations/20261125_00_default_variant_texts.ts'

const text = (value: string) => ({ fi: value, sv: value, en: value })

const texts = {
  shortName: text('Kieli'),
  explanation: text('Selitys'),
  extraInfo: text('Lisätieto'),
}

const catchAll = {
  name: 'default',
  organisationCode: null,
  lang: null,
  primaryLanguage: null,
  primaryLanguageSpecification: null,
  question: text('Kysymys'),
}

const specific = {
  name: 'sv-fi',
  organisationCode: null,
  lang: 'sv',
  primaryLanguage: 'fi',
  primaryLanguageSpecification: null,
  question: text('Fråga'),
}

describe('withDefaultTexts', () => {
  it('copies the filter texts onto the catch-all variant and leaves the others alone', () => {
    const migrated = withDefaultTexts([catchAll, specific], texts)

    expect(migrated).toHaveLength(2)
    expect(migrated[0].shortName).toEqual(text('Kieli'))
    expect(migrated[0].explanation).toEqual(text('Selitys'))
    expect(migrated[0].extraInfo).toEqual(text('Lisätieto'))
    expect(migrated[1].shortName).toBeUndefined()
  })

  it('keeps a text the catch-all variant already has', () => {
    const own = { ...catchAll, shortName: text('Oma nimi') }
    const migrated = withDefaultTexts([own], texts)

    expect(migrated[0].shortName).toEqual(text('Oma nimi'))
    expect(migrated[0].explanation).toEqual(text('Selitys'))
  })

  it('creates a catch-all variant for a filter that has none', () => {
    const migrated = withDefaultTexts([specific], texts)

    expect(migrated).toHaveLength(2)
    const created = migrated[1]
    expect(created.name).toBe('default')
    expect(created.lang).toBeNull()
    expect(created.primaryLanguage).toBeNull()
    expect(created.question).toEqual(text('Fråga'))
    expect(created.shortName).toEqual(text('Kieli'))
  })

  it('does not reuse a taken name when creating the catch-all variant', () => {
    const takenName = { ...specific, name: 'default' }
    const migrated = withDefaultTexts([takenName], texts)

    expect(migrated.map(variant => variant.name)).toEqual(['default', 'default_2'])
  })

  it('leaves absent optional texts absent', () => {
    const migrated = withDefaultTexts([catchAll], { shortName: text('Kieli'), explanation: null, extraInfo: null })

    expect(migrated[0].shortName).toEqual(text('Kieli'))
    expect(migrated[0].explanation).toBeUndefined()
    expect(migrated[0].extraInfo).toBeUndefined()
  })
})
