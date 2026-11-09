import { TFunction } from 'i18next'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { isCatchAll, resolveBest, type VariantQuery } from '../../common/conditionMatching'
import { FilterConfig, Question, Variant } from '../../common/types'
import { useFilterEditMode } from '../contexts/filterEditModeContext'
import { toQuestion } from '../util/filterConfigAdapter'
import useApi from '../util/useApi'

export type { VariantQuery }

// organisationCode: the student's faculty ("tiedekunta")
// lang: the language taught in the course ("mikä kieli kurssilla opetetaan")
// primaryLanguage: school lang
// primaryLanguageSpecification: what communication the course trains
export const toVariantQuery = (
  organisationCode: string,
  lang: string,
  primaryLanguage: string,
  primaryLanguageSpecification: string
): VariantQuery => ({ organisationCode, lang, primaryLanguage, primaryLanguageSpecification })

export const resolveVariant = (
  question: Question,
  context: VariantQuery
): { variant: Variant | undefined; isFallback: boolean } => {
  const hit = resolveBest(question.variants, context)
  if (hit) {
    return { variant: hit, isFallback: isCatchAll(hit) }
  }

  return { variant: question.variants.find(isCatchAll), isFallback: true }
}

export const pickVariant = (question: Question, context: VariantQuery) => resolveVariant(question, context).variant

export const pickQuestionExplanation = (context: VariantQuery | undefined, question: Question, t: TFunction) => {
  if (context) {
    const explanationVariant = resolveBest(question.variants, context)
    if (explanationVariant?.explanation) {
      return explanationVariant.explanation
    }
  }

  return question.explanation || t('question:noExtrainfo')
}

export const getOptionDisplayTexts = (variant: Variant | null, valueId: string | string[]): string[] => {
  const values = Array.isArray(valueId) == true ? valueId : [valueId]
  const options = variant?.options
  if (!variant || !options) {
    return values
  }

  const texts = []
  for (const value of values) {
    const option = options.find(o => o.id === value)
    if (option) {
      texts.push(option.name)
    }
  }

  if (texts.length == 0) {
    return values
  }

  return texts
}
const useQuestions = (): { filters: Question[]; isLoading: boolean } => {
  const { i18n } = useTranslation()
  const lang = i18n.language || 'fi'
  const { editingVersionId } = useFilterEditMode()

  const endPoint = editingVersionId
    ? `/api/admin/filter-config/snapshots/${editingVersionId}/config`
    : '/api/filter-config'
  const queryKey = editingVersionId ? `filter-config-draft-${editingVersionId}` : 'filter-config'

  const { data, isLoading } = useApi(queryKey, endPoint, 'GET', undefined)

  const filters = useMemo<Question[]>(
    () => (data ? (data as FilterConfig[]).map(cfg => toQuestion(cfg, lang)) : []),
    [data, lang]
  )

  return { filters, isLoading }
}

export default useQuestions
