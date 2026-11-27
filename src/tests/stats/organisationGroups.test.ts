import { describe, expect, it } from 'vitest'

import {
  groupKeyOf,
  groupLabelOf,
  isVisitorVisible,
  organisationColors,
  stackOrder,
  type StatsFilters,
  type StatsVisitorGroup,
} from '../../client/components/admin/stats/organisationGroups.ts'

const visitor = (fields: Partial<StatsVisitorGroup> = {}): StatsVisitorGroup => ({
  organisationCode: null,
  phase1Code: null,
  phase2Code: null,
  count: 1,
  ...fields,
})

const filters = (fields: Partial<StatsFilters> = {}): StatsFilters => ({
  organisations: [],
  phase1: [],
  phase2: [],
  ...fields,
})

describe('groupKeyOf', () => {
  it('keeps a code the chart has a colour for', () => {
    expect(groupKeyOf('H50')).toBe('H50')
  })

  it('collects every code the chart has no colour for under one key', () => {
    expect(groupKeyOf('H99')).toBe('other')
    expect(groupKeyOf('')).toBe('other')
  })

  it('separates a visitor with no organisation from the unlisted ones', () => {
    expect(groupKeyOf(null)).toBe('none')
  })
})

describe('groupLabelOf', () => {
  it('names the two synthetic groups', () => {
    expect(groupLabelOf('none')).toBe('No organisation')
    expect(groupLabelOf('other')).toBe('Other organisations')
  })

  it('names a faculty from the shared code table', () => {
    expect(groupLabelOf('H50')).toBe('Matemaattis-luonnontieteellinen')
  })

  it('falls back to the raw key when the code table has no name', () => {
    expect(groupLabelOf('H99')).toBe('H99')
  })
})

describe('stackOrder', () => {
  it('stacks the no-organisation group first and the unlisted ones last', () => {
    expect(stackOrder[0]).toBe('none')
    expect(stackOrder[stackOrder.length - 1]).toBe('other')
  })

  it('covers exactly the groups the colour map defines, so none can go missing from the chart', () => {
    expect([...stackOrder].sort()).toEqual(Object.keys(organisationColors).sort())
  })
})

describe('isVisitorVisible', () => {
  it('treats the filter lists as the groups to hide', () => {
    const hidden = visitor({ organisationCode: 'H50' })

    expect(isVisitorVisible(hidden, filters())).toBe(true)
    expect(isVisitorVisible(hidden, filters({ organisations: ['H50'] }))).toBe(false)
  })

  it('hides every unlisted organisation at once when the other group is hidden', () => {
    expect(isVisitorVisible(visitor({ organisationCode: 'H99' }), filters({ organisations: ['other'] }))).toBe(false)
    expect(isVisitorVisible(visitor({ organisationCode: 'H50' }), filters({ organisations: ['other'] }))).toBe(true)
  })

  it('matches programmes on the raw code rather than on an organisation group', () => {
    const visible = visitor({ phase1Code: 'KH50' })

    expect(isVisitorVisible(visible, filters({ phase1: ['KH50'] }))).toBe(false)
    expect(isVisitorVisible(visible, filters({ phase2: ['KH50'] }))).toBe(true)
  })

  it('hides a visitor whose programme is unknown under the unknown key', () => {
    expect(isVisitorVisible(visitor(), filters({ phase1: ['unknown'] }))).toBe(false)
  })

  it('hides a visitor that any one of the three filters excludes', () => {
    const anyVisitor = visitor({ organisationCode: 'H50', phase1Code: 'KH50', phase2Code: 'MH50' })

    expect(isVisitorVisible(anyVisitor, filters({ phase2: ['MH50'] }))).toBe(false)
  })
})
