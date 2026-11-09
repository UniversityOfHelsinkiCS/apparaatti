import type { VariantQuery } from '../../common/conditionMatching'
import { Question } from '../../common/types'
import { pickVariant } from '../hooks/useQuestions'

export const getDefaultSelectedOptionIds = (question: Question | undefined, context: VariantQuery): string[] => {
  if (!question) {
    return []
  }

  const variant = pickVariant(question, context)
  if (!variant?.options) {
    return []
  }

  return variant.options.filter(option => option.selectedByDefault === true).map(option => option.id)
}
