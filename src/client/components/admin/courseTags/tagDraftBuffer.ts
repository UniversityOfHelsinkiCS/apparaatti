import { describeCurTags } from '../../../../common/courseTags.ts'
import type {
  CourseTag,
  CourseTagMode,
  CurTagPremises,
  CuTagMutation,
  ResolvedTagSource,
  TagBase,
  TagMutations,
  TagPayloadDiff,
  TagVocabMutation,
} from '../../../../common/types.ts'

const STORAGE_KEY = 'apparaatti-course-tag-draft'

export const MAX_DRAFT_ENTRIES = 20000

export type CurTagModeOrClear = CourseTagMode | 'clear'

export type CurMutationsByCur = Record<string, Record<string, CurTagModeOrClear>>

export interface TagDraft {
  base: TagBase
  tags: Record<string, TagVocabMutation>
  cur: CurMutationsByCur
  cu: Record<string, CuTagMutation>
}

export const emptyDraft = (base: TagBase = { kind: 'published' }): TagDraft => ({
  base,
  tags: {},
  cur: {},
  cu: {},
})

const isRecord = (value: unknown): boolean => typeof value === 'object' && value !== null && !Array.isArray(value)

const isTagDraft = (value: any): value is TagDraft =>
  isRecord(value) &&
  isRecord(value.base) &&
  (value.base.kind === 'published' || value.base.kind === 'snapshot') &&
  isRecord(value.tags) &&
  isRecord(value.cur) &&
  isRecord(value.cu)

export const readDraft = (): TagDraft => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return emptyDraft()

    const parsed = JSON.parse(stored)
    return isTagDraft(parsed) ? parsed : emptyDraft()
  } catch {
    return emptyDraft()
  }
}

export const storeDraft = (draft: TagDraft) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    return
  }
}

export const clearStoredDraft = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}

export const draftSize = (draft: TagDraft): number =>
  Object.keys(draft.tags).length +
  Object.values(draft.cur).reduce((total, byTag) => total + Object.keys(byTag).length, 0) +
  Object.keys(draft.cu).length

export const baseKey = (base: TagBase): string => (base.kind === 'published' ? 'published' : `snapshot:${base.id}`)

export const toMutations = (draft: TagDraft): TagMutations => ({
  tags: Object.values(draft.tags),
  cur: Object.entries(draft.cur).flatMap(([curId, byTag]) =>
    Object.entries(byTag).map(([tagKey, mode]) => ({ curId, tagKey, mode }))
  ),
  cu: Object.values(draft.cu),
})

export const withCurMutation = (draft: TagDraft, curId: string, tagKey: string, mode: CurTagModeOrClear): TagDraft => ({
  ...draft,
  cur: { ...draft.cur, [curId]: { ...draft.cur[curId], [tagKey]: mode } },
})

export const withBulkCurMutations = (
  draft: TagDraft,
  curIds: string[],
  tagKeys: string[],
  mode: CurTagModeOrClear
): TagDraft => {
  const cur = { ...draft.cur }
  for (const curId of curIds) {
    const byTag = { ...cur[curId] }
    for (const tagKey of tagKeys) {
      byTag[tagKey] = mode
    }
    cur[curId] = byTag
  }
  return { ...draft, cur }
}

export const withCuMutation = (draft: TagDraft, entry: CuTagMutation): TagDraft => ({
  ...draft,
  cu: { ...draft.cu, [`${entry.courseCode}::${entry.tagKey}`]: entry },
})

export const withTagMutation = (draft: TagDraft, entry: TagVocabMutation): TagDraft => ({
  ...draft,
  tags: { ...draft.tags, [entry.key]: entry },
})

export const mergedVocabulary = (base: CourseTag[], tags: TagDraft['tags']): CourseTag[] => {
  const byKey = new Map(base.map(tag => [tag.key, tag]))

  for (const mutation of Object.values(tags)) {
    if (mutation.op === 'delete') {
      byKey.delete(mutation.key)
    } else {
      byKey.set(mutation.key, { id: byKey.get(mutation.key)?.id ?? -1, ...mutation })
    }
  }

  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key))
}

export type CuTagIndex = Map<string, Map<string, boolean>>

export const cuMutationIndex = (cu: TagDraft['cu']): CuTagIndex => {
  const index: CuTagIndex = new Map()

  for (const mutation of Object.values(cu)) {
    for (const cuId of mutation.cuIds) {
      const byTag = index.get(cuId) ?? new Map<string, boolean>()
      byTag.set(mutation.tagKey, mutation.present)
      index.set(cuId, byTag)
    }
  }

  return index
}

const NO_CUR_MUTATIONS: Record<string, CurTagModeOrClear> = {}

export const curTagStates = (
  premises: CurTagPremises,
  curMutations: Record<string, CurTagModeOrClear> = NO_CUR_MUTATIONS,
  cuIndex: CuTagIndex = new Map()
): Map<string, ResolvedTagSource> => {
  const inherited = new Set<string>()
  for (const cu of premises.cus) {
    const byTag = cuIndex.get(cu.cuId)
    for (const key of cu.tagKeys) {
      if (byTag?.get(key) !== false) inherited.add(key)
    }
    if (byTag) {
      for (const [key, present] of byTag) {
        if (present) inherited.add(key)
      }
    }
  }

  const rows = new Map(premises.rows.map(row => [row.tagKey, row.mode]))
  for (const [tagKey, mode] of Object.entries(curMutations)) {
    if (mode === 'clear') rows.delete(tagKey)
    else rows.set(tagKey, mode)
  }

  const described = describeCurTags(
    [...inherited],
    [...rows.entries()].map(([tagKey, mode]) => ({ curId: premises.curId, tagKey, mode }))
  )

  return new Map(described.map(tag => [tag.key, tag.source]))
}

export const draftDiff = (draft: TagDraft): TagPayloadDiff => {
  const mutations = toMutations(draft)

  return {
    addedTags: mutations.tags.filter(tag => tag.op === 'upsert').map(tag => tag.key),
    removedTags: mutations.tags.filter(tag => tag.op === 'delete').map(tag => tag.key),
    addedCuTags: mutations.cu
      .filter(entry => entry.present)
      .flatMap(entry => entry.cuIds.map(cuId => ({ cuId, tagKey: entry.tagKey }))),
    removedCuTags: mutations.cu
      .filter(entry => !entry.present)
      .flatMap(entry => entry.cuIds.map(cuId => ({ cuId, tagKey: entry.tagKey }))),
    addedCurTags: mutations.cur
      .filter(entry => entry.mode !== 'clear')
      .map(entry => ({ curId: entry.curId, tagKey: entry.tagKey, mode: entry.mode as CourseTagMode })),
    removedCurTags: mutations.cur
      .filter(entry => entry.mode === 'clear')
      .map(entry => ({ curId: entry.curId, tagKey: entry.tagKey, mode: 'add' as CourseTagMode })),
  }
}

export const cuTagKeys = (courseCode: string, baseKeys: string[], cu: TagDraft['cu']): Set<string> => {
  const keys = new Set(baseKeys)

  for (const mutation of Object.values(cu)) {
    if (mutation.courseCode !== courseCode) continue
    if (mutation.present) keys.add(mutation.tagKey)
    else keys.delete(mutation.tagKey)
  }

  return keys
}
