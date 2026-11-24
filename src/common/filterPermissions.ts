import type { FilterMutations, FilterSettingsMutation } from './types.ts'

export type RestrictedChange =
  | 'deleteVariant'
  | 'renameVariant'
  | 'variantConditions'
  | 'deleteOption'
  | 'optionId'
  | 'coordinateKey'
  | 'parentFilterId'

const settingsRestrictions = (mutation: FilterSettingsMutation): RestrictedChange[] => {
  if (mutation.op === 'deleteVariant') {
    return ['deleteVariant']
  }

  if (mutation.op === 'renameVariant') {
    return ['renameVariant']
  }

  if (mutation.op === 'variantConditions') {
    return ['variantConditions']
  }

  if (mutation.op === 'deleteOption') {
    return ['deleteOption']
  }

  if (mutation.op === 'optionSettings') {
    return mutation.settings.id === mutation.optionId ? [] : ['optionId']
  }

  if (mutation.op === 'filterSettings') {
    const found: RestrictedChange[] = []
    if (mutation.settings.coordinateKey !== undefined) {
      found.push('coordinateKey')
    }
    if (mutation.settings.parentFilterId !== undefined) {
      found.push('parentFilterId')
    }
    return found
  }

  return []
}

export const restrictedChanges = (mutations: FilterMutations): RestrictedChange[] => {
  const found = new Set<RestrictedChange>()

  for (const mutation of mutations.settings ?? []) {
    for (const restriction of settingsRestrictions(mutation)) {
      found.add(restriction)
    }
  }

  return [...found]
}
