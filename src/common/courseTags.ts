import type {
  ApparaattiTagSource,
  CourseTag,
  CurTagRow,
  CuTagRow,
  ResolvedCurTag,
  TagMutations,
  TagPayloadDiff,
  TagSnapshotPayload,
} from './types.ts'

export const TAG_URN_KEY = 'urn:code:custom:hy-university-root-id:kk-apparaatti:tags'

export const CUSTOM_CODE_URN_TAG_PREFIX = 'urn:code:custom:hy-university-root-id:kk-apparaatti:'

export function customCodeUrnTagKeys(customCodeUrns: Record<string, string[]> | null): string[] {
  const keys = new Set<string>()

  for (const [mapKey, urns] of Object.entries(customCodeUrns ?? {})) {
    if (mapKey === TAG_URN_KEY) continue
    for (const urn of urns) {
      if (!urn.startsWith(CUSTOM_CODE_URN_TAG_PREFIX)) continue
      const key = urn.slice(CUSTOM_CODE_URN_TAG_PREFIX.length)
      if (key.length > 0 && !key.includes(':')) keys.add(key)
    }
  }

  return [...keys]
}

function addedKeys(curRows: CurTagRow[]): string[] {
  return curRows.filter(row => row.mode === 'add').map(row => row.tagKey)
}

function ignoredKeys(curRows: CurTagRow[]): string[] {
  return curRows.filter(row => row.mode === 'ignore').map(row => row.tagKey)
}

export function resolveCurTags(
  inheritedKeys: string[],
  curRows: CurTagRow[],
  customCodeUrnKeys: string[] = []
): string[] {
  const ignored = new Set(ignoredKeys(curRows))
  const resolved = new Set<string>()

  for (const key of customCodeUrnKeys) {
    if (!ignored.has(key)) {
      resolved.add(key)
    }
  }
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

export function describeCurTags(
  inheritedKeys: string[],
  curRows: CurTagRow[],
  customCodeUrnKeys: string[] = []
): ResolvedCurTag[] {
  const inherited = new Set(inheritedKeys)
  const fromUrns = new Set(customCodeUrnKeys)
  const ignored = new Set(ignoredKeys(curRows))
  const added = new Set(addedKeys(curRows))

  const apparaattiSource = (key: string): ApparaattiTagSource | null => {
    if (added.has(key)) return 'added'
    if (inherited.has(key)) return 'inherited'
    return null
  }

  const described = new Map<string, ResolvedCurTag>()
  for (const key of [...fromUrns, ...inherited, ...added, ...ignored]) {
    described.set(key, {
      key,
      apparaatti: apparaattiSource(key),
      fromCustomCodeUrn: fromUrns.has(key),
      ignored: ignored.has(key),
    })
  }

  return [...described.values()]
}

export function tagsToCustomCodeUrns(
  base: Record<string, string[]> | null,
  keys: string[],
  ignoredKeys: string[] = []
): Record<string, string[]> {
  const ignored = new Set(ignoredKeys.map(key => `${CUSTOM_CODE_URN_TAG_PREFIX}${key}`))
  const kept: Record<string, string[]> = {}

  for (const [mapKey, urns] of Object.entries(base ?? {})) {
    kept[mapKey] = urns.filter(urn => !ignored.has(urn))
  }

  return { ...kept, [TAG_URN_KEY]: keys }
}

function mergedVocabulary(
  tags: Pick<CourseTag, 'key' | 'description'>[],
  mutations: TagMutations
): Pick<CourseTag, 'key' | 'description'>[] {
  const byKey = new Map(tags.map(tag => [tag.key, tag]))

  for (const mutation of mutations.tags) {
    if (mutation.op === 'delete') {
      byKey.delete(mutation.key)
    } else {
      byKey.set(mutation.key, { key: mutation.key, description: mutation.description })
    }
  }

  return [...byKey.values()]
}

function mergedCuTags(cuTags: CuTagRow[], mutations: TagMutations): CuTagRow[] {
  const byId = new Map(cuTags.map(row => [`${row.cuId}::${row.tagKey}`, row]))

  for (const mutation of mutations.cu) {
    for (const cuId of mutation.cuIds) {
      const id = `${cuId}::${mutation.tagKey}`
      if (mutation.present) {
        byId.set(id, { cuId, tagKey: mutation.tagKey })
      } else {
        byId.delete(id)
      }
    }
  }

  return [...byId.values()]
}

function mergedCurTags(curTags: CurTagRow[], mutations: TagMutations): CurTagRow[] {
  const byId = new Map(curTags.map(row => [`${row.curId}::${row.tagKey}`, row]))

  for (const mutation of mutations.cur) {
    const id = `${mutation.curId}::${mutation.tagKey}`
    if (mutation.mode === 'clear') {
      byId.delete(id)
    } else {
      byId.set(id, { curId: mutation.curId, tagKey: mutation.tagKey, mode: mutation.mode })
    }
  }

  return [...byId.values()]
}

export function mergeTagMutations(base: TagSnapshotPayload, mutations: TagMutations): TagSnapshotPayload {
  const tags = mergedVocabulary(base.tags, mutations)
  const known = new Set(tags.map(tag => tag.key))

  return {
    exportedAt: new Date().toISOString(),
    tags,
    cuTags: mergedCuTags(base.cuTags, mutations).filter(row => known.has(row.tagKey)),
    curTags: mergedCurTags(base.curTags, mutations).filter(row => known.has(row.tagKey)),
  }
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
