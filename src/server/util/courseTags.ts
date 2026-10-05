import type { CurTagRow, CuTagRow, ResolvedCurTag, TagPayloadDiff, TagSnapshotPayload } from '../../common/types.ts'

export const TAG_URN_KEY = 'urn:code:custom:hy-university-root-id:kk-apparaatti:tags'

function addedKeys(curRows: CurTagRow[]): string[] {
  return curRows.filter(row => row.mode === 'add').map(row => row.tagKey)
}

function ignoredKeys(curRows: CurTagRow[]): string[] {
  return curRows.filter(row => row.mode === 'ignore').map(row => row.tagKey)
}

export function resolveCurTags(inheritedKeys: string[], curRows: CurTagRow[]): string[] {
  const ignored = new Set(ignoredKeys(curRows))
  const resolved = new Set<string>()

  for (const key of inheritedKeys) {
    if (!ignored.has(key)) {
      resolved.add(key)
    }
  }
  for (const key of addedKeys(curRows)) {
    if (!ignored.has(key)) {
      resolved.add(key)
    }
  }

  return [...resolved]
}

export function describeCurTags(inheritedKeys: string[], curRows: CurTagRow[]): ResolvedCurTag[] {
  const inherited = new Set(inheritedKeys)
  const ignored = new Set(ignoredKeys(curRows))
  const described = new Map<string, ResolvedCurTag>()

  for (const key of inherited) {
    described.set(key, { key, source: ignored.has(key) ? 'ignored' : 'inherited' })
  }
  for (const key of addedKeys(curRows)) {
    if (!inherited.has(key)) {
      described.set(key, { key, source: ignored.has(key) ? 'ignored' : 'added' })
    }
  }

  return [...described.values()]
}

export function tagsToCustomCodeUrns(base: Record<string, string[]> | null, keys: string[]): Record<string, string[]> {
  return { ...(base ?? {}), [TAG_URN_KEY]: keys }
}

function curTagId(row: CurTagRow): string {
  return `${row.curId}::${row.tagKey}::${row.mode}`
}

function cuTagId(row: CuTagRow): string {
  return `${row.cuId}::${row.tagKey}`
}

export function diffTagPayloads(from: TagSnapshotPayload, to: TagSnapshotPayload): TagPayloadDiff {
  const fromTagKeys = new Set(from.tags.map(tag => tag.key))
  const toTagKeys = new Set(to.tags.map(tag => tag.key))
  const fromCuIds = new Set(from.cuTags.map(cuTagId))
  const toCuIds = new Set(to.cuTags.map(cuTagId))
  const fromCurIds = new Set(from.curTags.map(curTagId))
  const toCurIds = new Set(to.curTags.map(curTagId))

  return {
    addedTags: [...toTagKeys].filter(key => !fromTagKeys.has(key)),
    removedTags: [...fromTagKeys].filter(key => !toTagKeys.has(key)),
    addedCuTags: to.cuTags.filter(row => !fromCuIds.has(cuTagId(row))),
    removedCuTags: from.cuTags.filter(row => !toCuIds.has(cuTagId(row))),
    addedCurTags: to.curTags.filter(row => !fromCurIds.has(curTagId(row))),
    removedCurTags: from.curTags.filter(row => !toCurIds.has(curTagId(row))),
  }
}
