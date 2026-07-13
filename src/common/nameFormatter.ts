import type { Language, LocalizedString } from './types.ts'

type CourseNameInput = {
  id: string
  name: LocalizedString
  nameSpecifier?: LocalizedString | null
}

type FormatLocalizedCourseNameInput = CourseNameInput & {
  dropStudyMethod?: boolean
}

const fallbackLanguages: Language[] = ['fi', 'en', 'sv']

const removableStudyMethodPhrases = [
  'Monimuoto-opetus',
  'monimuoto',
  'etäopetus',
  'lähiopetus',
  'verkko-opetus',
  'itsenäinen projekti',
  'blended teaching',
  'distance teaching',
  'contact teaching',
  'online teaching',
  'flerformsundervisning',
  'distansundervisning',
  'kontaktundervisning',
] as const

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

const escapeForRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

//'giu' means: g = global, all matches, i = case insensitive, and u = unicode
//order matters here since reduce calls this as value=accumulator and phrase=currentItem
const removeStudyMethodPhrase = (value: string, phrase: string): string =>
  value.replace(new RegExp(escapeForRegExp(phrase), 'giu'), ' ')

const stripStudyMethodFromCourseName = (value: string | null): string | null => {
  if (!value) {
    return value
  }

  const cleanedSegments = value
    .split('|')
    .map(segment => segment.trim())
    .map(segment => removableStudyMethodPhrases.reduce(removeStudyMethodPhrase, segment))
    .map(segment =>
      segment
        .replace(/\(\s*\)/g, ' ') // remove empty parens: "( )" → " "
        .replace(/\[\s*\]/g, ' ') // remove empty brackets: "[ ]" → " "
        .replace(/\s{2,}/g, ' ') // collapse multiple spaces into one
        .replace(/\s+([,;:)\]])/g, '$1') // remove space before punctuation: " ," → ","
        .replace(/([([])\s+/g, '$1') // remove space after opening bracket: "( " → "("
        .replace(/^[\s,;:/-]+|[\s,;:/-]+$/g, '') // strip leading/trailing spaces and punctuation
        .trim()
    )
    .filter(segment => /[\p{L}\p{N}]/u.test(segment)) // drop segments with no letters or numbers (e.g. leftover punctuation)

  return cleanedSegments.length > 0 ? cleanedSegments.join(' | ') : null
}

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

export const stripPeriodTextFromCourseName = (name: string | null) => {
  if (!name) {
    return null
  }
  const pieces = name.split(',').map(p => p.trim())
  const noPeriodPieces = pieces.filter(p => !/\bperiod\w*/iu.test(p))
  const result = noPeriodPieces.join(', ')
  return result
}

export const cleanUpCourseName = (name: string | null) => {
  const studyMethodDropped = stripStudyMethodFromCourseName(name)
  const periodDropped = stripPeriodTextFromCourseName(studyMethodDropped)
  return periodDropped
}

export const getDisplayCourseName = (
  { id, name, nameSpecifier }: CourseNameInput,
  lang: Language | string,
  cleanName = true
): string | null => {
  const formattedName = formatCourseName(id, name, nameSpecifier, lang)

  return cleanName ? cleanUpCourseName(formattedName) : formattedName
}

export const formatLocalizedCourseName = ({
  id,
  name,
  nameSpecifier,
  dropStudyMethod = true,
}: FormatLocalizedCourseNameInput): string => {
  const names: string[] = []
  const applyStudyMethodOption = (value: string | null) =>
    dropStudyMethod ? stripStudyMethodFromCourseName(value) : value
  const finnishName = applyStudyMethodOption(formatCourseName(id, name, nameSpecifier, 'fi'))
  const englishName = applyStudyMethodOption(formatCourseName(id, name, nameSpecifier, 'en'))
  const swedishName = applyStudyMethodOption(formatCourseName(id, name, nameSpecifier, 'sv'))

  if (finnishName) names.push(`FI: ${finnishName}`)
  if (englishName) names.push(`EN: ${englishName}`)
  if (swedishName) names.push(`SV: ${swedishName}`)

  return names.length > 0 ? names.join(' | ') : '-'
}
