import type { FilterConfig, Language, LocalizedText, Question } from '../../common/types'

const fallbackLanguages: Language[] = ['fi', 'en', 'sv']

const resolveLanguage = (text: LocalizedText, lang: string): Language | undefined => {
  if (text[lang as Language]) {
    return lang as Language
  }

  return fallbackLanguages.find(fallback => text[fallback])
}

const localize = (text: LocalizedText, lang: string): string => text[lang as keyof LocalizedText] ?? text.fi ?? ''

export const toQuestion = (cfg: FilterConfig, lang: string): Question => ({
  id: cfg.id,
  mandatory: cfg.mandatory,
  shortName: localize(cfg.shortName, lang),
  shortNameLanguage: resolveLanguage(cfg.shortName, lang),
  explanation: cfg.explanation ? localize(cfg.explanation, lang) : undefined,
  extraInfo: cfg.extraInfo ? localize(cfg.extraInfo, lang) : undefined,
  isSubQuestionForQuestionId: cfg.parentFilterId ?? undefined,
  displayType: cfg.displayType ?? undefined,
  showInWelcomeModal: cfg.showInWelcomeModal,
  hideInCurrentFiltersDisplay: cfg.hideInCurrentFiltersDisplay,
  hideInFilterSidebar: cfg.hideInFilterSidebar,
  coordinateKey: cfg.coordinateKey ?? null,
  variants: cfg.variants.map(v => ({
    name: v.name,
    skipped: v.skipped,
    question: localize(v.question, lang),
    questionLanguage: resolveLanguage(v.question, lang),
    explanation: v.explanation ? localize(v.explanation, lang) : undefined,
    options: v.options?.map(o => ({
      id: o.id,
      name: localize(o.name, lang),
      nameLanguage: resolveLanguage(o.name, lang),
      valueOverride: o.valueOverride ?? undefined,
      selectedByDefault: o.selectedByDefault ?? undefined,
    })),
  })),
})
