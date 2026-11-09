export type MatchConditions = {
  organisationCode: string | null
  lang: string | null
  primaryLanguage: string | null
  primaryLanguageSpecification: string | null
}

export type VariantQuery = {
  organisationCode: string
  lang: string
  primaryLanguage: string
  primaryLanguageSpecification: string
}

// An all-wildcard query: resolveBest only ever matches the catch-all (all-null) item against this.
export const ANY_VARIANT_QUERY: VariantQuery = {
  organisationCode: '',
  lang: '',
  primaryLanguage: '',
  primaryLanguageSpecification: '',
}

export function matchesContext<T extends MatchConditions>(item: T, context: VariantQuery): boolean {
  if (item.organisationCode !== null && item.organisationCode !== context.organisationCode) return false
  if (item.lang !== null && item.lang !== context.lang) return false
  if (item.primaryLanguage !== null && item.primaryLanguage !== context.primaryLanguage) return false
  if (
    item.primaryLanguageSpecification !== null &&
    item.primaryLanguageSpecification !== context.primaryLanguageSpecification
  ) {
    return false
  }
  return true
}

export function isMoreSpecific<T extends MatchConditions>(value: T, than: T): boolean {
  if ((value.organisationCode === null) !== (than.organisationCode === null)) return than.organisationCode === null
  if ((value.lang === null) !== (than.lang === null)) return than.lang === null
  if ((value.primaryLanguage === null) !== (than.primaryLanguage === null)) return than.primaryLanguage === null
  return than.primaryLanguageSpecification === null && value.primaryLanguageSpecification !== null
}

export function resolveBest<T extends MatchConditions>(items: T[], context: VariantQuery): T | null {
  const matching = items.filter(item => matchesContext(item, context))
  if (matching.length === 0) return null
  return matching.reduce((best, item) => (isMoreSpecific(item, best) ? item : best))
}

export function isCatchAll<T extends MatchConditions>(item: T): boolean {
  if (item.organisationCode !== null) return false
  if (item.lang !== null) return false
  if (item.primaryLanguage !== null) return false
  if (item.primaryLanguageSpecification !== null) return false
  return true
}

export function describeVariantQuery(context: VariantQuery): string {
  const parts = [context.lang, context.primaryLanguage, context.primaryLanguageSpecification, context.organisationCode]
  const label = parts.filter(part => part !== '').join('-')
  return label || 'default'
}

// Like describeVariantQuery, but for an existing variant's own (nullable) conditions, where
// null means "any" rather than being an unset string.
export function describeConditions(conditions: MatchConditions): string {
  if (isCatchAll(conditions)) {
    return 'default'
  }
  const parts = [
    conditions.lang,
    conditions.primaryLanguage,
    conditions.primaryLanguageSpecification,
    conditions.organisationCode,
  ]
  return parts.filter((part): part is string => part !== null).join('-')
}
