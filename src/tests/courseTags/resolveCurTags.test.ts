import { describe, expect, it } from 'vitest'

import type { CurTagRow } from '../../common/types.ts'
import { describeCurTags, resolveCurTags } from '../../server/util/courseTags.ts'

const row = (tagKey: string, mode: CurTagRow['mode']): CurTagRow => ({ curId: 'cur-1', tagKey, mode })

describe('resolveCurTags', () => {
  it('returns the inherited keys when the cur has no rows of its own', () => {
    expect(resolveCurTags(['kks-kor', 'kks-pre'], [])).toEqual(['kks-kor', 'kks-pre'])
  })

  it('adds cur level tags when nothing is inherited', () => {
    expect(resolveCurTags([], [row('kks-val', 'add')])).toEqual(['kks-val'])
  })

  it('does not duplicate a tag that is both inherited and added', () => {
    expect(resolveCurTags(['kks-kor'], [row('kks-kor', 'add')])).toEqual(['kks-kor'])
  })

  it('drops an inherited tag that the cur ignores', () => {
    expect(resolveCurTags(['kks-kor', 'kks-pre'], [row('kks-pre', 'ignore')])).toEqual(['kks-kor'])
  })

  it('is a no-op when ignoring a tag that was never inherited', () => {
    expect(resolveCurTags(['kks-kor'], [row('kks-val', 'ignore')])).toEqual(['kks-kor'])
  })

  it('brings the inherited tag back once the ignore row is cleared', () => {
    const inherited = ['kks-kor', 'kks-pre']
    expect(resolveCurTags(inherited, [row('kks-pre', 'ignore')])).toEqual(['kks-kor'])
    expect(resolveCurTags(inherited, [])).toEqual(['kks-kor', 'kks-pre'])
  })

  it('dedupes keys inherited from several course units', () => {
    expect(resolveCurTags(['kks-kor', 'kks-kor', 'kks-val'], [])).toEqual(['kks-kor', 'kks-val'])
  })
})

describe('describeCurTags', () => {
  it('labels inherited, added and ignored keys exactly once each', () => {
    const described = describeCurTags(['kks-kor', 'kks-pre'], [row('kks-val', 'add'), row('kks-pre', 'ignore')])

    expect(described).toEqual([
      { key: 'kks-kor', source: 'inherited' },
      { key: 'kks-pre', source: 'ignored' },
      { key: 'kks-val', source: 'added' },
    ])
  })

  it('still reports an ignored key that resolveCurTags leaves out', () => {
    const inherited = ['kks-pre']
    const rows = [row('kks-pre', 'ignore')]

    expect(describeCurTags(inherited, rows).map(tag => tag.key)).toContain('kks-pre')
    expect(resolveCurTags(inherited, rows)).not.toContain('kks-pre')
  })
})
