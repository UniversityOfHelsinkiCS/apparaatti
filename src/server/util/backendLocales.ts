import type {
  BackendLocaleContext,
  BackendLocaleKey,
  BackendLocaleValue,
  ResolvedBackendLocales,
} from '../../common/types.ts'

export function matchesContext(value: BackendLocaleValue, context: BackendLocaleContext) {
  if (value.organisationCode !== null && value.organisationCode !== context.organisationCode) return false
  if (value.lang !== null && value.lang !== context.lang) return false
  if (value.primaryLanguage !== null && value.primaryLanguage !== context.primaryLanguage) return false
  if (
    value.primaryLanguageSpecification !== null &&
    value.primaryLanguageSpecification !== context.primaryLanguageSpecification
  ) {
    return false
  }
  return true
}

export function isMoreSpecific(value: BackendLocaleValue, than: BackendLocaleValue) {
  if ((value.organisationCode === null) !== (than.organisationCode === null)) return than.organisationCode === null
  if ((value.lang === null) !== (than.lang === null)) return than.lang === null
  if ((value.primaryLanguage === null) !== (than.primaryLanguage === null)) return than.primaryLanguage === null
  return than.primaryLanguageSpecification === null && value.primaryLanguageSpecification !== null
}

export function resolveValue(values: BackendLocaleValue[], context: BackendLocaleContext) {
  const matching = values.filter(value => matchesContext(value, context))
  if (matching.length === 0) return null
  return matching.reduce((best, value) => (isMoreSpecific(value, best) ? value : best))
}

export function resolveBackendLocales(keys: BackendLocaleKey[], context: BackendLocaleContext) {
  const resolved: ResolvedBackendLocales = {}
  for (const key of keys) {
    const match = resolveValue(key.values, context)
    resolved[key.key] = match === null ? null : match.text
  }
  return resolved
}
