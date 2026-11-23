import type {
  FilterMutations,
  FilterOptionSettings,
  FilterSettingsMutation,
  FilterSettingsPatch,
} from '../../../common/types'

export type OptionSettingsEntry = {
  variantName: string
  optionId: string
  settings: FilterOptionSettings
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
  options: OptionSettingsEntry[]
): FilterMutations => {
  const ops: FilterSettingsMutation[] = [{ op: 'filterSettings', filterId, settings }]
  for (const entry of options) {
    ops.push({
      op: 'optionSettings',
      filterId,
      variantName: entry.variantName,
      optionId: entry.optionId,
      settings: entry.settings,
    })
  }

  return { wordings: [], settings: ops }
}

export const orderMutations = (order: string[]): FilterMutations => ({
  wordings: [],
  settings: [{ op: 'filterOrder', order }],
})

export const enabledMutations = (filterId: string, enabled: boolean): FilterMutations => ({
  wordings: [],
  settings: [{ op: 'filterSettings', filterId, settings: { enabled } }],
})
