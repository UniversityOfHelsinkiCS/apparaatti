import {
  isMoreSpecific as isMoreSpecificConditions,
  matchesContext as matchesContextConditions,
  resolveBest,
} from '../../common/conditionMatching.ts'
import type {
  BackendLocaleContext,
  BackendLocaleKey,
  BackendLocaleValue,
  ResolvedBackendLocales,
} from '../../common/types.ts'

export function matchesContext(value: BackendLocaleValue, context: BackendLocaleContext) {
  return matchesContextConditions(value, context)
}

export function isMoreSpecific(value: BackendLocaleValue, than: BackendLocaleValue) {
  return isMoreSpecificConditions(value, than)
}

export function resolveValue(values: BackendLocaleValue[], context: BackendLocaleContext) {
  return resolveBest(values, context)
}

export function resolveBackendLocales(keys: BackendLocaleKey[], context: BackendLocaleContext) {
  const resolved: ResolvedBackendLocales = {}
  for (const key of keys) {
    const match = resolveValue(key.values, context)
    resolved[key.key] = match === null ? null : match.text
  }
  return resolved
}
