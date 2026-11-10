import type { Question, Variant } from '../../../common/types'
import { pickVariant, toVariantQuery, type VariantQuery } from '../../hooks/useQuestions'
import type { FilterContextType } from '../filterContext'
import { filterConfigMap, type FilterStateType, isFilterStateAnswered } from './filterState'

export const shouldRenderWelcomeFilter = (
  filterId: string,
  variant: Variant | undefined,
  language: string,
  primaryLanguage: string
): boolean => {
  if (!variant || variant.skipped) {
    return false
  }

  if (filterId === 'primary-language-specification') {
    return language !== '' && language !== 'en' && language === primaryLanguage
  }

  return true
}

/**
 * @returns
 * Mandatory filters that are being displayed in the app,
 * taking into account the cases where the user searches for main language courses
 */
type MandatoryCheckState = FilterStateType & { variantQuery: VariantQuery }

export const getUnansweredCurrentMandatoryFilters = (filters: Question[], state: MandatoryCheckState) => {
  const configMap = filterConfigMap(state)
  const { variantQuery, language, primaryLanguage } = state

  return filters.filter(filter => {
    if (!filter.mandatory) {
      return false
    }

    const variant = pickVariant(filter, variantQuery)
    if (!shouldRenderWelcomeFilter(filter.id, variant, language, primaryLanguage)) {
      return false
    }

    const config = configMap.get(filter.id)
    if (!config) {
      return false
    }

    return !isFilterStateAnswered(config.state)
  })
}

export const shouldShowFilterInSidebar = (filter: Pick<Question, 'hideInFilterSidebar'>) => {
  return !filter.hideInFilterSidebar
}

export const shouldResetFilter = (filter: Pick<Question, 'id' | 'showInWelcomeModal'>) => {
  return !filter.showInWelcomeModal || filter.id === 'primary-language-specification'
}

export const getCoordinateDisplayName = (coordinateKey: string, filterContext: any): string => {
  const question = filterContext.filters.find((q: any) => q.coordinateKey === coordinateKey)
  return question?.shortName ?? coordinateKey
}

export const getFilterVariant = (filterContext: FilterContextType, filterId: string) => {
  const question = filterContext.filters.find((q: any) => q.id === filterId)
  const context = toVariantQuery(
    filterContext.studyField,
    filterContext.language,
    filterContext.primaryLanguage,
    filterContext.primaryLanguageSpecification
  )

  const variant = question != undefined ? pickVariant(question, context) : null
  if (variant) {
    return variant
  } else {
    return null
  }
}
