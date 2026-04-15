import { useState } from 'react'
import type { FilterConfig, FilterOption, FilterVariant } from '../../../../common/types.ts'
import { blankLocalized, blankFilter, normalizeDraft } from './filterEditorUtils.ts'

export const useFilterDraft = (filter: FilterConfig | null) => {
  const [draft, setDraft] = useState<FilterConfig>(() =>
    filter === null ? blankFilter() : normalizeDraft(filter)
  )

  const patch = (fields: Partial<FilterConfig>) =>
    setDraft((prev) => ({ ...prev, ...fields }))

  const patchShortName = (lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => ({ ...prev, shortName: { ...prev.shortName, [lang]: val } }))

  const patchExplanation = (lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => ({
      ...prev,
      explanation: { ...(prev.explanation ?? blankLocalized()), [lang]: val },
    }))

  const patchExtraInfo = (lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => ({
      ...prev,
      extraInfo: { ...(prev.extraInfo ?? blankLocalized()), [lang]: val },
    }))

  const patchVariant = (vIdx: number, fields: Partial<FilterVariant>) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      variants[vIdx] = { ...variants[vIdx], ...fields }
      return { ...prev, variants }
    })

  const patchVariantQuestion = (vIdx: number, lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      variants[vIdx] = {
        ...variants[vIdx],
        question: { ...variants[vIdx].question, [lang]: val },
      }
      return { ...prev, variants }
    })

  const patchVariantExplanation = (vIdx: number, lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const v = variants[vIdx]
      variants[vIdx] = {
        ...v,
        explanation: { ...(v.explanation ?? blankLocalized()), [lang]: val },
      }
      return { ...prev, variants }
    })

  const updateOption = (vIdx: number, oIdx: number, fields: Partial<FilterOption>) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const options = [...(variants[vIdx].options ?? [])]
      options[oIdx] = { ...options[oIdx], ...fields }
      variants[vIdx] = { ...variants[vIdx], options }
      return { ...prev, variants }
    })

  const updateOptionName = (vIdx: number, oIdx: number, lang: 'fi' | 'sv' | 'en', val: string) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const options = [...(variants[vIdx].options ?? [])]
      options[oIdx] = { ...options[oIdx], name: { ...options[oIdx].name, [lang]: val } }
      variants[vIdx] = { ...variants[vIdx], options }
      return { ...prev, variants }
    })

  const addOption = (vIdx: number) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const options = [...(variants[vIdx].options ?? []), { id: '', name: blankLocalized() }]
      variants[vIdx] = { ...variants[vIdx], options }
      return { ...prev, variants }
    })

  const removeOption = (vIdx: number, oIdx: number) =>
    setDraft((prev) => {
      const variants = [...prev.variants]
      const options = (variants[vIdx].options ?? []).filter((_, i) => i !== oIdx)
      variants[vIdx] = { ...variants[vIdx], options }
      return { ...prev, variants }
    })

  const addVariant = () =>
    setDraft((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: '', question: blankLocalized(), options: [] }],
    }))

  const removeVariant = (vIdx: number) =>
    setDraft((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== vIdx),
    }))

  return {
    draft,
    patch,
    patchShortName,
    patchExplanation,
    patchExtraInfo,
    patchVariant,
    patchVariantQuestion,
    patchVariantExplanation,
    updateOption,
    updateOptionName,
    addOption,
    removeOption,
    addVariant,
    removeVariant,
  }
}
