import { describeConditions, type MatchConditions } from '../../../common/conditionMatching'
import type { FilterMutations, FilterVariant, FilterWordingMutation, LocalizedText } from '../../../common/types'
import type { EditTarget } from '../../contexts/filterEditModeContext'
import { describeFilterVariant } from './changeVariant'

/** Where an edited text is saved: an existing variant of the filter, or a new one with these conditions. */
export type PickedTarget = { mode: 'existing'; variantName: string } | { mode: 'new'; conditions: MatchConditions }

type TargetLabels = {
  /** Label of the catch-all variant, e.g. "Yleinen oletusteksti". */
  defaultLabel: string
  /** Label of a variant still to be created, given its key, e.g. "Uusi variantti: sv-fi". */
  newVariant: (variantKey: string) => string
}

export const describePickedTarget = (
  picked: PickedTarget,
  filterVariants: FilterVariant[],
  labels: TargetLabels
): string => {
  if (picked.mode === 'new') {
    return labels.newVariant(describeConditions(picked.conditions))
  }
  const variant = filterVariants.find(candidate => candidate.name === picked.variantName)
  return variant ? describeFilterVariant(variant, labels.defaultLabel) : picked.variantName
}

export const emptyLocalized: LocalizedText = { fi: '', sv: '', en: '' }

/** Fields whose text lives in a variant; the rest (shortName, extraInfo) belong to the whole filter. */
export const isVariantField = (target: EditTarget) =>
  target.field === 'question' || target.field === 'explanation' || target.field === 'option'

/** The existing text of the edited field in the given variant. */
export const textForVariant = (target: EditTarget, variant: FilterVariant | undefined): LocalizedText => {
  if (!variant) {
    return emptyLocalized
  }
  if (target.field === 'question') {
    return variant.question
  }
  if (target.field === 'explanation') {
    return variant.explanation ?? emptyLocalized
  }
  if (target.field === 'option') {
    return variant.options?.find(option => option.id === target.optionId)?.name ?? emptyLocalized
  }
  return emptyLocalized
}

export const wordingMutations = (target: EditTarget, text: LocalizedText, picked: PickedTarget): FilterMutations => {
  const wordings: FilterWordingMutation[] = []
  const variantName = picked.mode === 'new' ? describeConditions(picked.conditions) : picked.variantName

  if (picked.mode === 'new') {
    wordings.push({
      op: 'createVariant',
      filterId: target.filterId,
      variantName,
      fromVariantName: target.variantName,
      organisationCode: picked.conditions.organisationCode,
      lang: picked.conditions.lang,
      primaryLanguage: picked.conditions.primaryLanguage,
      primaryLanguageSpecification: picked.conditions.primaryLanguageSpecification,
    })
  }

  if (target.field === 'shortName') {
    wordings.push({ op: 'shortName', filterId: target.filterId, text })
  } else if (target.field === 'extraInfo') {
    wordings.push({ op: 'extraInfo', filterId: target.filterId, text })
  } else if (target.field === 'question') {
    wordings.push({ op: 'variantQuestion', filterId: target.filterId, variantName, text })
  } else if (target.field === 'explanation') {
    wordings.push({ op: 'variantExplanation', filterId: target.filterId, variantName, text })
  } else {
    wordings.push({
      op: 'optionName',
      filterId: target.filterId,
      variantName,
      optionId: target.optionId ?? '',
      text,
    })
  }

  return { wordings }
}
