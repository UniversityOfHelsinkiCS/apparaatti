import { Question } from '../../common/types'
import { pickVariant } from '../hooks/useQuestions'

export const getDefaultSelectedOptionIds = (
  question: Question | undefined,
  variantId: string
): string[] => {
  if (!question) {
    return []
  }

  const variant = pickVariant(question, variantId)
  if (!variant?.options) {
    return []
  }

  return variant.options
    .filter((option) => option.selectedByDefault === true)
    .map((option) => option.id)
}
