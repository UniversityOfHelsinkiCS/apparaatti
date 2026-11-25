import type { Question, Variant } from '../../../common/types'
import { resolveVariant } from '../../hooks/useQuestions'
import type { FilterContextType } from '../filterContext'
import { shouldRenderWelcomeFilter } from './filterRules'
import { filterConfigMap, type FilterConfigMapType } from './filterState'

export type RenderableFilter = {
  question: Question
  variant: Variant
  isFallback: boolean
  config: FilterConfigMapType | undefined
  shortName: string
  shortNameSource: Question | Variant
  filterToRender: Question & {
    displayType: string
    state: string | string[]
    setState: (state: string | string[]) => void
    shortName: string
  }
}

export const resolveRenderableFilter = (question: Question, context: FilterContextType): RenderableFilter | null => {
  const { variant, isFallback } = resolveVariant(question, context.variantQuery)

  if (!shouldRenderWelcomeFilter(question.id, variant, context.language, context.primaryLanguage)) {
    return null
  }

  if (!variant) {
    return null
  }

  const config = filterConfigMap(context).get(question.id)
  const shortNameSource = variant.shortName ? variant : question
  const shortName = shortNameSource.shortName ?? question.id

  const filterToRender = {
    ...question,
    displayType: question.displayType ?? 'singlechoice',
    state: config ? config.state : '',
    setState: config ? config.setState : () => {},
    shortName,
  }

  return { question, variant, isFallback, config, shortName, shortNameSource, filterToRender }
}
