import { organisationRecommendations } from '../../../data/data.ts'
import type { RecommendationCodeRow } from '../../common/types.ts'
import logger from '../util/logger.ts'

export type RecommendationLanguageSeed = {
  generatedName: string
  name: { fi: string; en: string; sv: string }
  lang: string
  languageType: string | null
  primaryLanguageSpecification: string | null
}

export const RECOMMENDATION_LANGUAGE_SEEDS: RecommendationLanguageSeed[] = [
  {
    generatedName: 'Englanti',
    name: { fi: 'Englanti', en: 'English', sv: 'Engelska' },
    lang: 'en',
    languageType: null,
    primaryLanguageSpecification: null,
  },
  {
    generatedName: 'Äidinkieli, suomi: puheviestintä',
    name: {
      fi: 'Äidinkieli, suomi: puheviestintä',
      en: 'Mother tongue, Finnish: speech communication',
      sv: 'Modersmål, finska: talkommunikation',
    },
    lang: 'fi',
    languageType: 'primary',
    primaryLanguageSpecification: 'spoken',
  },
  {
    generatedName: 'Äidinkieli, suomi: kirjoitusviestintä',
    name: {
      fi: 'Äidinkieli, suomi: kirjoitusviestintä',
      en: 'Mother tongue, Finnish: written communication',
      sv: 'Modersmål, finska: skriftlig kommunikation',
    },
    lang: 'fi',
    languageType: 'primary',
    primaryLanguageSpecification: 'written',
  },
  {
    generatedName: 'Äidinkieli, ruotsi: puheviestintä',
    name: {
      fi: 'Äidinkieli, ruotsi: puheviestintä',
      en: 'Mother tongue, Swedish: speech communication',
      sv: 'Modersmål, svenska: talkommunikation',
    },
    lang: 'sv',
    languageType: 'primary',
    primaryLanguageSpecification: 'spoken',
  },
  {
    generatedName: 'Äidinkieli, ruotsi: kirjoitusviestintä',
    name: {
      fi: 'Äidinkieli, ruotsi: kirjoitusviestintä',
      en: 'Mother tongue, Swedish: written communication',
      sv: 'Modersmål, svenska: skriftlig kommunikation',
    },
    lang: 'sv',
    languageType: 'primary',
    primaryLanguageSpecification: 'written',
  },
  {
    generatedName: 'Toinen kotimainen, suomi',
    name: {
      fi: 'Toinen kotimainen, suomi',
      en: 'Second national language, Finnish',
      sv: 'Det andra inhemska språket, finska',
    },
    lang: 'fi',
    languageType: 'secondary',
    primaryLanguageSpecification: null,
  },
  {
    generatedName: 'Toinen kotimainen, ruotsi',
    name: {
      fi: 'Toinen kotimainen, ruotsi',
      en: 'Second national language, Swedish',
      sv: 'Det andra inhemska språket, svenska',
    },
    lang: 'sv',
    languageType: 'secondary',
    primaryLanguageSpecification: null,
  },
]
type GeneratedCode = { organisationCode: string; seed: RecommendationLanguageSeed; courseCode: string }

export function generatedCodes(): GeneratedCode[] {
  return organisationRecommendations.flatMap(organisation =>
    organisation.languages.flatMap(language => {
      const seed = RECOMMENDATION_LANGUAGE_SEEDS.find(candidate => candidate.generatedName === language.name)
      if (!seed) {
        logger.warn(`Unknown recommendation language in data/data.ts, skipping: ${language.name}`)
        return []
      }

      return language.codes.map(courseCode => ({ organisationCode: organisation.name, seed, courseCode }))
    })
  )
}

export function generatedRecommendationCodeRows(): RecommendationCodeRow[] {
  return generatedCodes().map(({ organisationCode, seed, courseCode }) => ({
    organisationCode,
    lang: seed.lang,
    languageType: seed.languageType,
    primaryLanguageSpecification: seed.primaryLanguageSpecification,
    courseCode,
  }))
}
