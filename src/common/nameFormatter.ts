import type { Language, LocalizedString } from './types.ts'

type CourseNameInput = {
  id: string
  name: LocalizedString
  nameSpecifier?: LocalizedString | null
}

const fallbackLanguages: Language[] = ['fi', 'en', 'sv']

const getLanguageValue = (
  values: LocalizedString | null | undefined,
  preferred: Language | string | null | undefined
): string | null => {
  if (!values) {
    return null
  }

  if (preferred && preferred in values) {
    const preferredValue = values[preferred as Language]
    if (preferredValue) return preferredValue
  }

  for (const lang of fallbackLanguages) {
    if (values[lang]) return values[lang] ?? null
  }

  return null
}

const hasSisuLikeNamingConvention = (id: string): boolean => id.startsWith('otm-') || id.startsWith('hy-cur-aili-')

const isOptimeOriginatingId = (id: string): boolean => id.startsWith('hy-opt-cur-')

const courseNameWithCourseType = (
  name: LocalizedString | string | null | undefined,
  type: LocalizedString | string | null | undefined,
  lang: Language | string
): string | null => {
  const translatedName = typeof name === 'string' ? name : getLanguageValue(name, lang)
  const translatedType = typeof type === 'string' ? type : getLanguageValue(type, lang)

  if (!translatedName) {
    return translatedType
  }
  if (!translatedType) {
    return translatedName
  }

  if (translatedType.startsWith(translatedName)) {
    return translatedType
  }

  return `${translatedName} | ${translatedType}`
}

export const formatCourseName = (
  id: string,
  name: LocalizedString,
  nameSpecifier: LocalizedString | null | undefined,
  lang: Language | string
): string | null => {
  if (hasSisuLikeNamingConvention(id)) {
    return courseNameWithCourseType(nameSpecifier, name, lang)
  }

  if (isOptimeOriginatingId(id)) {
    return courseNameWithCourseType(name, null, lang)
  }

  return courseNameWithCourseType(name, nameSpecifier, lang)
}

export const getDisplayCourseName = (
  { id, name, nameSpecifier }: CourseNameInput,
  lang: Language | string
): string | null => formatCourseName(id, name, nameSpecifier, lang)

export const formatLocalizedCourseName = ({ id, name, nameSpecifier }: CourseNameInput): string => {
  const names = []
  const finnishName = formatCourseName(id, name, nameSpecifier, 'fi')
  const englishName = formatCourseName(id, name, nameSpecifier, 'en')
  const swedishName = formatCourseName(id, name, nameSpecifier, 'sv')

  if (finnishName) names.push(`FI: ${finnishName}`)
  if (englishName) names.push(`EN: ${englishName}`)
  if (swedishName) names.push(`SV: ${swedishName}`)

  return names.length > 0 ? names.join(' | ') : '-'
}
