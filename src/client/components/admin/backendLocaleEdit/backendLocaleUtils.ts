import type { BackendLocaleKey, BackendLocaleValue, LocalizedText } from '../../../../common/types.ts'

export type ValueDraft = {
  organisationCode: string
  lang: string
  primaryLanguage: string
  primaryLanguageSpecification: string
  text: LocalizedText
}

export const blankLocalized = (): LocalizedText => ({ fi: '', sv: '', en: '' })

export const emptyValueDraft = (): ValueDraft => ({
  organisationCode: '',
  lang: '',
  primaryLanguage: '',
  primaryLanguageSpecification: '',
  text: blankLocalized(),
})

export const toValueDraft = (value: BackendLocaleValue): ValueDraft => ({
  organisationCode: value.organisationCode ?? '',
  lang: value.lang ?? '',
  primaryLanguage: value.primaryLanguage ?? '',
  primaryLanguageSpecification: value.primaryLanguageSpecification ?? '',
  text: value.text,
})

export const toPayload = (draft: ValueDraft) => ({
  organisationCode: draft.organisationCode || null,
  lang: draft.lang || null,
  primaryLanguage: draft.primaryLanguage || null,
  primaryLanguageSpecification: draft.primaryLanguageSpecification || null,
  text: draft.text,
})

export const isCatchAll = (value: BackendLocaleValue) => {
  if (value.organisationCode !== null) return false
  if (value.lang !== null) return false
  if (value.primaryLanguage !== null) return false
  if (value.primaryLanguageSpecification !== null) return false
  return true
}

export const hasCatchAllValue = (key: BackendLocaleKey) => key.values.some(isCatchAll)
