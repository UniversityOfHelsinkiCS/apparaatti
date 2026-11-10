import { describeConditions, isCatchAll, type VariantQuery } from '../../../common/conditionMatching'
import type { FilterVariant } from '../../../common/types'

/**
 * Mirrors filterContext: the specification answer only exists when the course language is set,
 * is not English and equals the school language. Otherwise the context clears it.
 */
export const specificationIsAsked = (query: VariantQuery): boolean =>
  query.lang !== '' && query.lang !== 'en' && query.lang === query.primaryLanguage

export const normalizeVariantQuery = (query: VariantQuery): VariantQuery =>
  specificationIsAsked(query) ? query : { ...query, primaryLanguageSpecification: '' }

export const describeFilterVariant = (variant: FilterVariant, defaultLabel: string): string =>
  isCatchAll(variant) ? defaultLabel : describeConditions(variant)
