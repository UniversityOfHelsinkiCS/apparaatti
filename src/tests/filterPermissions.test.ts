import { describe, expect, it } from 'vitest'

import { restrictedChanges } from '../common/filterPermissions'
import type { FilterMutations } from '../common/types'

const settings = (ops: FilterMutations['settings']): FilterMutations => ({ wordings: [], settings: ops })

describe('restrictedChanges', () => {
  it('reports every structural op as superuser-only', () => {
    const found = restrictedChanges(
      settings([
        { op: 'deleteVariant', filterId: 'lang', variantName: 'sv_only' },
        { op: 'renameVariant', filterId: 'lang', variantName: 'default', newName: 'yleinen' },
        {
          op: 'variantConditions',
          filterId: 'lang',
          variantName: 'default',
          conditions: { organisationCode: null, lang: 'sv', primaryLanguage: null, primaryLanguageSpecification: null },
        },
        { op: 'deleteOption', filterId: 'lang', variantName: 'default', optionId: 'sv' },
      ])
    )

    expect(found.sort()).toEqual(['deleteOption', 'deleteVariant', 'renameVariant', 'variantConditions'])
  })

  it('allows an option edit that keeps the id, and restricts one that retypes it', () => {
    const unchanged = restrictedChanges(
      settings([
        {
          op: 'optionSettings',
          filterId: 'lang',
          variantName: 'default',
          optionId: 'sv',
          settings: { id: 'sv', valueOverride: 'SV', selectedByDefault: true },
        },
      ])
    )
    const retyped = restrictedChanges(
      settings([
        {
          op: 'optionSettings',
          filterId: 'lang',
          variantName: 'default',
          optionId: 'sv',
          settings: { id: 'swedish', valueOverride: null, selectedByDefault: false },
        },
      ])
    )

    expect(unchanged).toEqual([])
    expect(retyped).toEqual(['optionId'])
  })

  it('separates plain flags from the wiring fields in one patch', () => {
    const flagsOnly = restrictedChanges(
      settings([{ op: 'filterSettings', filterId: 'lang', settings: { enabled: false, mandatory: true } }])
    )
    const withWiring = restrictedChanges(
      settings([
        {
          op: 'filterSettings',
          filterId: 'lang',
          settings: { enabled: false, coordinateKey: 'x', parentFilterId: null },
        },
      ])
    )

    expect(flagsOnly).toEqual([])
    expect(withWiring.sort()).toEqual(['coordinateKey', 'parentFilterId'])
  })

  it('never restricts wording-only mutations', () => {
    const found = restrictedChanges({
      wordings: [
        { op: 'shortName', filterId: 'lang', text: { fi: 'Kieli', sv: 'Språk', en: 'Language' } },
        { op: 'filterExplanation', filterId: 'lang', text: null },
        { op: 'variantQuestion', filterId: 'lang', variantName: 'default', text: { fi: 'A', sv: 'A', en: 'A' } },
      ],
      settings: [],
    })

    expect(found).toEqual([])
  })

  it('does not restrict adding options or variants, or skipping a variant', () => {
    const found = restrictedChanges(
      settings([
        {
          op: 'addOption',
          filterId: 'lang',
          variantName: 'default',
          optionId: 'en',
          name: { fi: 'Englanti', sv: 'Engelska', en: 'English' },
        },
        { op: 'variantSkipped', filterId: 'lang', variantName: 'default', skipped: true },
        { op: 'filterOrder', order: ['lang', 'level'] },
      ])
    )

    expect(found).toEqual([])
  })
})
