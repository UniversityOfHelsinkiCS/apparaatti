import { describe, expect, it } from 'vitest'

import { organisationCodeToName } from '../../common/organisations.ts'
import { generatedRecommendationCodeRows } from '../../server/db/recommendationCodeSeeds.ts'
import { codesForAnswers } from '../../server/util/organisationCourseRecommmendations.ts'

const LANGS = ['fi', 'sv', 'en']
const PRIMARY_LANGUAGES = ['fi', 'sv']
const SPECIFICATIONS = ['spoken', 'written', 'writtenAndSpoken', 'neutral']

const rows = generatedRecommendationCodeRows()

const codesFor = (organisationCode: string, lang: string, primaryLanguage: string, specification: string) =>
  codesForAnswers(rows, organisationCode, lang, primaryLanguage, specification).sort()

const everyCombination = () => {
  const result: Record<string, string[]> = {}

  for (const organisationCode of Object.keys(organisationCodeToName)) {
    for (const lang of LANGS) {
      for (const primaryLanguage of PRIMARY_LANGUAGES) {
        for (const specification of SPECIFICATIONS) {
          const key = `${organisationCode} lang=${lang} primary=${primaryLanguage} spec=${specification}`
          result[key] = codesFor(organisationCode, lang, primaryLanguage, specification)
        }
      }
    }
  }

  return result
}

describe('recommendation code resolution', () => {
  it('resolves the same codes for every organisation and language combination', () => {
    expect(everyCombination()).toMatchSnapshot()
  })

  it('unions the spoken and written codes when the user answers writtenAndSpoken', () => {
    const spoken = codesFor('H57', 'fi', 'fi', 'spoken')
    const written = codesFor('H57', 'fi', 'fi', 'written')
    const both = codesFor('H57', 'fi', 'fi', 'writtenAndSpoken')

    expect(both).toEqual([...spoken, ...written].sort())
  })

  it('returns no codes for a primary language when the specification is missing', () => {
    expect(codesFor('H57', 'fi', 'fi', 'neutral')).toEqual([])
    expect(codesFor('H57', 'sv', 'sv', 'neutral')).toEqual([])
  })

  it('ignores the specification for a secondary language', () => {
    const spoken = codesFor('H57', 'fi', 'sv', 'spoken')

    expect(spoken).toEqual(codesFor('H57', 'fi', 'sv', 'written'))
    expect(spoken).toEqual(codesFor('H57', 'fi', 'sv', 'neutral'))
    expect(spoken.length).toBeGreaterThan(0)
  })

  it('returns the same english codes whether english is the primary or the secondary language', () => {
    const asPrimary = codesFor('H57', 'en', 'en', 'writtenAndSpoken')
    const asSecondary = codesFor('H57', 'en', 'fi', 'writtenAndSpoken')

    expect(asPrimary).toEqual(asSecondary)
    expect(asPrimary.length).toBeGreaterThan(0)
  })

  it('ignores the specification for english', () => {
    expect(codesFor('H57', 'en', 'fi', 'neutral')).toEqual(codesFor('H57', 'en', 'fi', 'writtenAndSpoken'))
  })

  it('returns no codes for a language that has no recommendations', () => {
    expect(codesFor('H57', 'de', 'fi', 'writtenAndSpoken')).toEqual([])
  })

  it('returns no codes for an unknown organisation', () => {
    expect(codesFor('NOT-AN-ORG', 'en', 'fi', 'writtenAndSpoken')).toEqual([])
  })
})
