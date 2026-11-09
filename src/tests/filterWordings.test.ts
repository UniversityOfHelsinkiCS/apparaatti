import { describe, expect, it } from 'vitest'

import { diffFilterPayloads, mergeFilterMutations } from '../common/filterWordings'
import type { FilterConfig, FilterSnapshotPayload } from '../common/types'

const baseFilter: FilterConfig = {
  id: 'lang',
  mandatory: true,
  shortName: { fi: 'Kieli', sv: 'Språk', en: 'Language' },
  displayOrder: 1,
  displayType: 'singlechoice',
  hideInCurrentFiltersDisplay: false,
  hideInRecommendationReasons: false,
  hideInFilterSidebar: false,
  showInWelcomeModal: true,
  coordinateKey: 'lang',
  enabled: true,
  variants: [
    {
      name: 'default',
      organisationCode: null,
      lang: null,
      primaryLanguage: null,
      primaryLanguageSpecification: null,
      question: { fi: 'Mikä kieli?', sv: 'Vilket språk?', en: 'Which language?' },
      options: [
        { id: 'fi', name: { fi: 'Suomi', sv: 'Finska', en: 'Finnish' } },
        { id: 'sv', name: { fi: 'Ruotsi', sv: 'Svenska', en: 'Swedish' } },
      ],
    },
  ],
}

const fiPrimaryWrittenConditions = {
  organisationCode: null,
  lang: 'fi',
  primaryLanguage: 'fi',
  primaryLanguageSpecification: 'written',
}

const svUnknownConditions = {
  organisationCode: null,
  lang: 'sv',
  primaryLanguage: 'sv',
  primaryLanguageSpecification: null,
}

const payload = (): FilterSnapshotPayload => ({ filters: [structuredClone(baseFilter)] })

describe('mergeFilterMutations', () => {
  it('creates a variant from default without touching default', () => {
    const merged = mergeFilterMutations(payload(), {
      wordings: [
        {
          op: 'createVariant',
          filterId: 'lang',
          variantName: 'fi_primary_written',
          fromVariantName: 'default',
          ...fiPrimaryWrittenConditions,
        },
        {
          op: 'variantQuestion',
          filterId: 'lang',
          variantName: 'fi_primary_written',
          text: { fi: 'Uusi', sv: 'Ny', en: 'New' },
        },
      ],
    })

    const variants = merged.filters[0].variants
    expect(variants.map(variant => variant.name)).toEqual(['default', 'fi_primary_written'])
    expect(variants[0].question.fi).toBe('Mikä kieli?')
    expect(variants[1].question.fi).toBe('Uusi')
    expect(variants[1].options?.map(option => option.id)).toEqual(['fi', 'sv'])
  })

  it('ignores a text mutation aimed at a variant that does not exist', () => {
    const merged = mergeFilterMutations(payload(), {
      wordings: [
        { op: 'variantQuestion', filterId: 'lang', variantName: 'missing', text: { fi: 'X', sv: 'X', en: 'X' } },
      ],
    })

    expect(merged.filters[0].variants).toHaveLength(1)
    expect(merged.filters[0].variants[0].question.fi).toBe('Mikä kieli?')
  })

  it('renames only the named option', () => {
    const merged = mergeFilterMutations(payload(), {
      wordings: [
        {
          op: 'optionName',
          filterId: 'lang',
          variantName: 'default',
          optionId: 'sv',
          text: { fi: 'Ruotsiksi', sv: 'På svenska', en: 'In Swedish' },
        },
      ],
    })

    const options = merged.filters[0].variants[0].options
    expect(options?.[0].name.fi).toBe('Suomi')
    expect(options?.[1].name.fi).toBe('Ruotsiksi')
  })
})

describe('diffFilterPayloads', () => {
  it('reports a wording changed in one language only', () => {
    const changed = mergeFilterMutations(payload(), {
      wordings: [
        {
          op: 'variantQuestion',
          filterId: 'lang',
          variantName: 'default',
          text: { fi: 'Mikä kieli?', sv: 'Vilket språk vill du?', en: 'Which language?' },
        },
      ],
    })

    const diff = diffFilterPayloads(payload(), changed)
    expect(diff.changedTexts).toHaveLength(1)
    expect(diff.changedTexts[0].field).toBe('question')
    expect(diff.changedTexts[0].to?.sv).toBe('Vilket språk vill du?')
  })

  it('reports an added variant as added and not as a text change', () => {
    const changed = mergeFilterMutations(payload(), {
      wordings: [
        {
          op: 'createVariant',
          filterId: 'lang',
          variantName: 'sv_unknown',
          fromVariantName: 'default',
          ...svUnknownConditions,
        },
      ],
    })

    const diff = diffFilterPayloads(payload(), changed)
    expect(diff.addedVariants).toEqual([{ filterId: 'lang', variantName: 'sv_unknown' }])
    expect(diff.changedTexts).toEqual([])
  })
})
