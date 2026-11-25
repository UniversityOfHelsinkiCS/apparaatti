import { defaultVariant } from '../../common/conditionMatching'
import type { FilterConfig, Language, LocalizedText, Question } from '../../common/types'

const fallbackLanguages: Language[] = ['fi', 'en', 'sv']

const resolveLanguage = (text: LocalizedText, lang: string): Language | undefined => {
  if (text[lang as Language]) {
    return lang as Language
  }

  return fallbackLanguages.find(fallback => text[fallback])
}

export const localize = (text: LocalizedText, lang: string): string =>
  text[lang as keyof LocalizedText] ?? text.fi ?? ''

export const toQuestion = (cfg: FilterConfig, lang: string): Question => {
  const fallback = defaultVariant(cfg.variants)
  const shortName = fallback?.shortName ?? cfg.shortName
  const explanation = fallback?.explanation ?? cfg.explanation
  const extraInfo = fallback?.extraInfo ?? cfg.extraInfo

  const question: Question = {
    id: cfg.id,
    mandatory: cfg.mandatory,
    shortName: localize(shortName, lang),
    shortNameLanguage: resolveLanguage(shortName, lang),
    explanation: explanation ? localize(explanation, lang) : undefined,
    extraInfo: extraInfo ? localize(extraInfo, lang) : undefined,
    isSubQuestionForQuestionId: cfg.parentFilterId ?? undefined,
    displayType: cfg.displayType ?? undefined,
    showInWelcomeModal: cfg.showInWelcomeModal,
    hideInCurrentFiltersDisplay: cfg.hideInCurrentFiltersDisplay,
    hideInFilterSidebar: cfg.hideInFilterSidebar,
    coordinateKey: cfg.coordinateKey ?? null,
    raw: cfg,
    variants: cfg.variants.map(v => ({
      raw: v,
      name: v.name,
      organisationCode: v.organisationCode,
      lang: v.lang,
      primaryLanguage: v.primaryLanguage,
      primaryLanguageSpecification: v.primaryLanguageSpecification,
      skipped: v.skipped,
      question: localize(v.question, lang),
      questionLanguage: resolveLanguage(v.question, lang),
      explanation: v.explanation ? localize(v.explanation, lang) : undefined,
      shortName: v.shortName ? localize(v.shortName, lang) : undefined,
      shortNameLanguage: v.shortName ? resolveLanguage(v.shortName, lang) : undefined,
      extraInfo: v.extraInfo ? localize(v.extraInfo, lang) : undefined,
      extraInfoDisabled: v.extraInfoDisabled,
      options: v.options?.map(o => ({
        id: o.id,
        name: localize(o.name, lang),
        nameLanguage: resolveLanguage(o.name, lang),
        valueOverride: o.valueOverride ?? undefined,
        selectedByDefault: o.selectedByDefault ?? undefined,
      })),
    })),
  }

  return question
}
