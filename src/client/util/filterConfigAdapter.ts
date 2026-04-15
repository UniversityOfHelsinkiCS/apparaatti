import type { FilterConfig, LocalizedText, Question } from '../../common/types'

const localize = (text: LocalizedText, lang: string): string =>
  text[lang as keyof LocalizedText] ?? text.fi ?? ''

export const toQuestion = (cfg: FilterConfig, lang: string): Question => ({
  id: cfg.id,
  mandatory: cfg.mandatory,
  shortName: localize(cfg.shortName, lang),
  explanation: cfg.explanation ? localize(cfg.explanation, lang) : undefined,
  extraInfo: cfg.extraInfo ? localize(cfg.extraInfo, lang) : undefined,
  isSubQuestionForQuestionId: cfg.parentFilterId ?? undefined,
  displayType: cfg.displayType ?? undefined,
  superToggle: cfg.superToggle,
  showInWelcomeModal: cfg.showInWelcomeModal,
  hideInCurrentFiltersDisplay: cfg.hideInCurrentFiltersDisplay,
  hideInRecommendationReasons: cfg.hideInRecommendationReasons,
  hideInFilterSidebar: cfg.hideInFilterSidebar,
  coordinateKey: cfg.coordinateKey ?? null,
  isStrictByDefault: cfg.isStrictByDefault,
  variants: cfg.variants.map((v) => ({
    name: v.name,
    skipped: v.skipped,
    question: localize(v.question, lang),
    explanation: v.explanation ? localize(v.explanation, lang) : undefined,
    options: v.options?.map((o) => ({
      id: o.id,
      name: localize(o.name, lang),
      valueOverride: o.valueOverride ?? undefined,
      setStrict: o.setStrict ?? undefined,
    })),
  })),
})
