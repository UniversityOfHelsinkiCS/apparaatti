import { afterEach, describe, expect, it } from 'vitest'

import {
  readDraft,
  toMutations,
  withBulkCurMutations,
  withCuMutation,
  withCurMutation,
  withTagMutation,
} from '../../client/components/admin/courseTags/tagDraftBuffer.ts'
import { describeCurTags, mergeTagMutations } from '../../common/courseTags.ts'
import type { TagMutations, TagSnapshotPayload } from '../../common/types.ts'

const base: TagSnapshotPayload = {
  tags: [
    { key: 'kks-kor', description: null },
    { key: 'kks-val', description: null },
  ],
  cuTags: [{ cuId: 'cu-1', tagKey: 'kks-kor' }],
  curTags: [{ curId: 'cur-1', tagKey: 'kks-val', mode: 'add' }],
}

const mutations = (overrides: Partial<TagMutations>): TagMutations => ({
  tags: [],
  cur: [],
  cu: [],
  ...overrides,
})

describe('mergeTagMutations', () => {
  it('adds a cur row that was not there before', () => {
    const merged = mergeTagMutations(base, mutations({ cur: [{ curId: 'cur-2', tagKey: 'kks-kor', mode: 'add' }] }))

    expect(merged.curTags).toContainEqual({ curId: 'cur-2', tagKey: 'kks-kor', mode: 'add' })
  })

  it('replaces the mode of an existing cur row rather than duplicating it', () => {
    const merged = mergeTagMutations(base, mutations({ cur: [{ curId: 'cur-1', tagKey: 'kks-val', mode: 'ignore' }] }))

    expect(merged.curTags.filter(row => row.curId === 'cur-1' && row.tagKey === 'kks-val')).toEqual([
      { curId: 'cur-1', tagKey: 'kks-val', mode: 'ignore' },
    ])
  })

  it('clears a cur row', () => {
    const merged = mergeTagMutations(base, mutations({ cur: [{ curId: 'cur-1', tagKey: 'kks-val', mode: 'clear' }] }))

    expect(merged.curTags).toEqual([])
  })

  it('drops the cur and cu rows of a deleted tag', () => {
    const merged = mergeTagMutations(base, mutations({ tags: [{ op: 'delete', key: 'kks-kor' }] }))

    expect(merged.tags.map(tag => tag.key)).toEqual(['kks-val'])
    expect(merged.cuTags).toEqual([])
    expect(merged.curTags).toEqual([{ curId: 'cur-1', tagKey: 'kks-val', mode: 'add' }])
  })

  it('keeps a cur row whose tag is created in the same draft', () => {
    const merged = mergeTagMutations(
      base,
      mutations({
        tags: [{ op: 'upsert', key: 'kks-new', description: 'fresh' }],
        cur: [{ curId: 'cur-1', tagKey: 'kks-new', mode: 'add' }],
      })
    )

    expect(merged.curTags).toContainEqual({ curId: 'cur-1', tagKey: 'kks-new', mode: 'add' })
  })

  it('survives a round trip through the nested draft buffer', () => {
    const empty = { base: { kind: 'published' as const }, tags: {}, cur: {}, cu: {} }

    const draft = withTagMutation(
      withCuMutation(
        withCurMutation(withCurMutation(empty, 'cur-1', 'kks-val', 'clear'), 'cur-2', 'kks-kor', 'ignore'),
        { courseCode: 'ABC', cuIds: ['cu-1'], tagKey: 'kks-kor', present: false }
      ),
      { op: 'upsert', key: 'kks-new', description: 'fresh' }
    )

    const merged = mergeTagMutations(base, toMutations(draft))

    expect(merged.curTags).toEqual([{ curId: 'cur-2', tagKey: 'kks-kor', mode: 'ignore' }])
    expect(merged.cuTags).toEqual([])
    expect(merged.tags.map(tag => tag.key).sort()).toEqual(['kks-kor', 'kks-new', 'kks-val'])
  })

  it('keeps other realisations reference-identical when one is toggled', () => {
    const empty = { base: { kind: 'published' as const }, tags: {}, cur: {}, cu: {} }
    const seeded = withBulkCurMutations(empty, ['cur-1', 'cur-2'], ['kks-val'], 'add')

    const toggled = withCurMutation(seeded, 'cur-1', 'kks-val', 'clear')

    expect(toggled.cur['cur-2']).toBe(seeded.cur['cur-2'])
    expect(toggled.cur['cur-1']).not.toBe(seeded.cur['cur-1'])
  })

  it('a cu mutation changes what a cur inherits', () => {
    const merged = mergeTagMutations(
      base,
      mutations({ cu: [{ courseCode: 'ABC', cuIds: ['cu-1'], tagKey: 'kks-kor', present: false }] })
    )

    const inherited = merged.cuTags.filter(row => row.cuId === 'cu-1').map(row => row.tagKey)
    expect(describeCurTags(inherited, [])).toEqual([])
  })
})

describe('readDraft', () => {
  const stub = (stored: string | null) => {
    ;(globalThis as any).window = { localStorage: { getItem: () => stored } }
  }

  afterEach(() => {
    delete (globalThis as any).window
  })

  it('falls back to an empty draft when the stored value is from an older shape', () => {
    stub(JSON.stringify({ base: { kind: 'published' }, mutations: { tags: [], cur: [], cu: [] } }))

    expect(readDraft()).toEqual({ base: { kind: 'published' }, tags: {}, cur: {}, cu: {} })
  })

  it('falls back to an empty draft on unparseable or unexpected values', () => {
    stub('not json at all')
    expect(readDraft().cur).toEqual({})

    stub(JSON.stringify({ base: { kind: 'published' }, tags: {}, cur: [], cu: {} }))
    expect(readDraft().cur).toEqual({})
  })

  it('keeps a draft that matches the current shape', () => {
    const draft = {
      base: { kind: 'snapshot', id: 7 },
      tags: {},
      cur: { 'cur-1': { 'kks-val': 'add' } },
      cu: {},
    }
    stub(JSON.stringify(draft))

    expect(readDraft()).toEqual(draft)
  })
})
