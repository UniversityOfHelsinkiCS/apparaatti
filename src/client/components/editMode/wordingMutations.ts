import { describeConditions } from '../../../common/conditionMatching'
import type { FilterMutations, FilterVariant, FilterWordingMutation, LocalizedText } from '../../../common/types'
import type { EditTarget } from '../../contexts/filterEditModeContext'
import type { PickedTarget } from './VariantTargetChoice'

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

export const wordingMutations = (
  target: EditTarget,
  text: LocalizedText,
  picked: PickedTarget | null
): FilterMutations => {
  const wordings: FilterWordingMutation[] = []
  let variantName = target.variantName

  if (picked?.mode === 'new') {
    variantName = describeConditions(picked.conditions)
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
  } else if (picked?.mode === 'existing') {
    variantName = picked.variantName
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
