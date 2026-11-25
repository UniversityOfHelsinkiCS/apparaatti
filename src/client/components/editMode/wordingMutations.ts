import { defaultVariant, describeConditions, type MatchConditions } from '../../../common/conditionMatching'
import type {
  FilterMutations,
  FilterVariant,
  FilterWordingField,
  FilterWordingMutation,
  LocalizedText,
} from '../../../common/types'
import type { EditTarget } from '../../contexts/filterEditModeContext'
import { describeFilterVariant } from './changeVariant'

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

export const isVariantField = (field: FilterWordingField) =>
  field === 'question' ||
  field === 'explanation' ||
  field === 'option' ||
  field === 'variantShortName' ||
  field === 'variantExtraInfo'

export const hasSharedFallback = (field: FilterWordingField) =>
  field === 'explanation' || field === 'variantShortName' || field === 'variantExtraInfo'

export const isDefaultVariant = (filterVariants: FilterVariant[], variantName: string) =>
  defaultVariant(filterVariants)?.name === variantName

export const isShortNameField = (field: FilterWordingField) => field === 'shortName' || field === 'variantShortName'

export const isBlank = (text: LocalizedText) => !text.fi && !text.sv && !text.en

/** The existing text of the edited field in the given variant. */
export const textForVariant = (target: EditTarget, variant: FilterVariant | undefined): LocalizedText => {
  if (!variant) {
    return emptyLocalized
  }
  if (target.field === 'question') {
    return variant.question
  }
  if (target.field === 'explanation') {
    return variant.explanation ?? target.filterText ?? emptyLocalized
  }
  if (target.field === 'variantShortName') {
    return variant.shortName ?? target.filterText ?? emptyLocalized
  }
  if (target.field === 'variantExtraInfo') {
    return variant.extraInfo ?? target.filterText ?? emptyLocalized
  }
  if (target.field === 'option') {
    return variant.options?.find(option => option.id === target.optionId)?.name ?? emptyLocalized
  }
  return emptyLocalized
}

export const hasOwnText = (target: EditTarget, variantName: string): boolean => {
  const variant = target.filterVariants.find(candidate => candidate.name === variantName)
  if (!variant) {
    return false
  }
  if (target.field === 'explanation') {
    return variant.explanation !== undefined
  }
  if (target.field === 'variantShortName') {
    return variant.shortName !== undefined
  }
  if (target.field === 'variantExtraInfo') {
    return variant.extraInfo !== undefined
  }
  return false
}

const filterWideOp = (
  field: FilterWordingField,
  filterId: string,
  text: LocalizedText | null
): FilterWordingMutation => {
  if (field === 'shortName' || field === 'variantShortName') {
    return { op: 'shortName', filterId, text: text ?? emptyLocalized }
  }
  if (field === 'extraInfo' || field === 'variantExtraInfo') {
    return { op: 'extraInfo', filterId, text }
  }
  return { op: 'filterExplanation', filterId, text }
}

const variantOp = (
  field: FilterWordingField,
  filterId: string,
  variantName: string,
  optionId: string,
  text: LocalizedText | null
): FilterWordingMutation => {
  if (field === 'question') {
    return { op: 'variantQuestion', filterId, variantName, text: text ?? emptyLocalized }
  }
  if (field === 'explanation') {
    return { op: 'variantExplanation', filterId, variantName, text }
  }
  if (field === 'variantShortName') {
    return { op: 'variantShortName', filterId, variantName, text }
  }
  if (field === 'variantExtraInfo') {
    return { op: 'variantExtraInfo', filterId, variantName, text }
  }
  return { op: 'optionName', filterId, variantName, optionId, text: text ?? emptyLocalized }
}

export const wordingMutations = (
  target: EditTarget,
  text: LocalizedText | null,
  picked: PickedTarget
): FilterMutations => {
  if (!isVariantField(target.field)) {
    return { wordings: [filterWideOp(target.field, target.filterId, text)], settings: [] }
  }

  const variantName = picked.mode === 'new' ? describeConditions(picked.conditions) : picked.variantName
  const wordings: FilterWordingMutation[] = []

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

  wordings.push(variantOp(target.field, target.filterId, variantName, target.optionId ?? '', text))

  return { wordings, settings: [] }
}
