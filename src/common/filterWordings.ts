import type {
  FilterConfig,
  FilterMutations,
  FilterOption,
  FilterPayloadDiff,
  FilterSnapshotPayload,
  FilterTextChange,
  FilterVariant,
  FilterWordingMutation,
  LocalizedText,
} from './types.ts'

export const emptyFilterMutations: FilterMutations = { wordings: [] }

const withVariant = (config: FilterConfig, variantName: string, fromVariantName: string): FilterConfig => {
  if (config.variants.some(variant => variant.name === variantName)) {
    return config
  }

  const source =
    config.variants.find(variant => variant.name === fromVariantName) ??
    config.variants.find(variant => variant.name === 'default') ??
    config.variants[0]

  if (!source) {
    return config
  }

  const created: FilterVariant = {
    ...source,
    name: variantName,
    options: source.options ? source.options.map(option => ({ ...option })) : undefined,
  }

  return { ...config, variants: [...config.variants, created] }
}

const patchVariant = (
  config: FilterConfig,
  variantName: string,
  patch: (variant: FilterVariant) => FilterVariant
): FilterConfig => ({
  ...config,
  variants: config.variants.map(variant => (variant.name === variantName ? patch(variant) : variant)),
})

const patchOptionName = (variant: FilterVariant, optionId: string, text: LocalizedText): FilterVariant => ({
  ...variant,
  options: (variant.options ?? []).map(option => (option.id === optionId ? { ...option, name: text } : option)),
})

const applyWording = (config: FilterConfig, mutation: FilterWordingMutation): FilterConfig => {
  if (mutation.op === 'createVariant') {
    return withVariant(config, mutation.variantName, mutation.fromVariantName)
  }

  if (mutation.op === 'shortName') {
    return { ...config, shortName: mutation.text }
  }

  if (mutation.op === 'extraInfo') {
    return { ...config, extraInfo: mutation.text ?? undefined }
  }

  if (mutation.op === 'variantQuestion') {
    return patchVariant(config, mutation.variantName, variant => ({ ...variant, question: mutation.text }))
  }

  if (mutation.op === 'variantExplanation') {
    return patchVariant(config, mutation.variantName, variant => ({
      ...variant,
      explanation: mutation.text ?? undefined,
    }))
  }

  return patchVariant(config, mutation.variantName, variant =>
    patchOptionName(variant, mutation.optionId, mutation.text)
  )
}

export function mergeFilterMutations(base: FilterSnapshotPayload, mutations: FilterMutations): FilterSnapshotPayload {
  const filters = base.filters.map(config => {
    const relevant = mutations.wordings.filter(mutation => mutation.filterId === config.id)
    return relevant.reduce(applyWording, config)
  })

  return { exportedAt: new Date().toISOString(), filters }
}

const sameText = (a: LocalizedText | null | undefined, b: LocalizedText | null | undefined): boolean => {
  if (!a && !b) {
    return true
  }
  if (!a || !b) {
    return false
  }
  return a.fi === b.fi && a.sv === b.sv && a.en === b.en
}

const optionById = (options: FilterOption[] | undefined, id: string): FilterOption | undefined =>
  (options ?? []).find(option => option.id === id)

export function diffFilterPayloads(from: FilterSnapshotPayload, to: FilterSnapshotPayload): FilterPayloadDiff {
  const addedVariants: FilterPayloadDiff['addedVariants'] = []
  const changedTexts: FilterTextChange[] = []

  const change = (
    filterId: string,
    variantName: string | null,
    field: FilterTextChange['field'],
    optionId: string | null,
    before: LocalizedText | null | undefined,
    after: LocalizedText | null | undefined
  ) => {
    if (sameText(before, after)) {
      return
    }
    changedTexts.push({ filterId, variantName, field, optionId, from: before ?? null, to: after ?? null })
  }

  const fromById = new Map(from.filters.map(config => [config.id, config]))

  for (const config of to.filters) {
    const previous = fromById.get(config.id)
    if (!previous) {
      continue
    }

    change(config.id, null, 'shortName', null, previous.shortName, config.shortName)
    change(config.id, null, 'extraInfo', null, previous.extraInfo, config.extraInfo)

    for (const variant of config.variants) {
      const previousVariant = previous.variants.find(candidate => candidate.name === variant.name)
      if (!previousVariant) {
        addedVariants.push({ filterId: config.id, variantName: variant.name })
        continue
      }

      change(config.id, variant.name, 'question', null, previousVariant.question, variant.question)
      change(config.id, variant.name, 'explanation', null, previousVariant.explanation, variant.explanation)

      for (const option of variant.options ?? []) {
        const previousOption = optionById(previousVariant.options, option.id)
        if (!previousOption) {
          continue
        }
        change(config.id, variant.name, 'option', option.id, previousOption.name, option.name)
      }
    }
  }

  return { addedVariants, changedTexts }
}
