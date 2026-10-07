import { describe, expect, it } from 'vitest'

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

  it('a cu mutation changes what a cur inherits', () => {
    const merged = mergeTagMutations(
      base,
      mutations({ cu: [{ courseCode: 'ABC', cuIds: ['cu-1'], tagKey: 'kks-kor', present: false }] })
    )

    const inherited = merged.cuTags.filter(row => row.cuId === 'cu-1').map(row => row.tagKey)
    expect(describeCurTags(inherited, [])).toEqual([])
  })
})
