import type { MatchConditions } from '../../../common/conditionMatching'
import type {
  FilterMutations,
  FilterOptionSettings,
  FilterSettingsMutation,
  FilterSettingsPatch,
  LocalizedText,
} from '../../../common/types'

export type OptionChange =
  | { kind: 'settings'; variantName: string; optionId: string; settings: FilterOptionSettings }
  | { kind: 'add'; variantName: string; optionId: string; name: LocalizedText }
  | { kind: 'delete'; variantName: string; optionId: string }

export type VariantChange = {
  variantName: string
  conditions: MatchConditions | null
  skipped: boolean | null
  newName: string | null
  deleted: boolean
}

export const FILTER_FLAGS = [
  'enabled',
  'mandatory',
  'showInWelcomeModal',
  'hideInFilterSidebar',
  'hideInCurrentFiltersDisplay',
  'hideInRecommendationReasons',
] as const

export type FilterFlag = (typeof FILTER_FLAGS)[number]

export const settingsMutations = (
  filterId: string,
  settings: FilterSettingsPatch,
  options: OptionChange[],
  variants: VariantChange[]
): FilterMutations => {
  const ops: FilterSettingsMutation[] = [{ op: 'filterSettings', filterId, settings }]

  const pushOption = (change: OptionChange) => {
    if (change.kind === 'add') {
      ops.push({
        op: 'addOption',
        filterId,
        variantName: change.variantName,
        optionId: change.optionId,
        name: change.name,
      })
      return
    }

    if (change.kind === 'delete') {
      ops.push({ op: 'deleteOption', filterId, variantName: change.variantName, optionId: change.optionId })
      return
    }

    ops.push({
      op: 'optionSettings',
      filterId,
      variantName: change.variantName,
      optionId: change.optionId,
      settings: change.settings,
    })
  }

  const pushVariant = (change: VariantChange) => {
    if (change.deleted) {
      ops.push({ op: 'deleteVariant', filterId, variantName: change.variantName })
      return
    }

    if (change.conditions !== null) {
      ops.push({ op: 'variantConditions', filterId, variantName: change.variantName, conditions: change.conditions })
    }

    if (change.skipped !== null) {
      ops.push({ op: 'variantSkipped', filterId, variantName: change.variantName, skipped: change.skipped })
    }

    if (change.newName !== null) {
      ops.push({ op: 'renameVariant', filterId, variantName: change.variantName, newName: change.newName })
    }
  }

  for (const change of options) {
    pushOption(change)
  }

  for (const change of variants) {
    pushVariant(change)
  }

  return { wordings: [], settings: ops }
}

export const orderMutations = (order: string[]): FilterMutations => ({
  wordings: [],
  settings: [{ op: 'filterOrder', order }],
})

export const flagMutations = (filterId: string, settings: FilterSettingsPatch): FilterMutations => ({
  wordings: [],
  settings: [{ op: 'filterSettings', filterId, settings }],
})
