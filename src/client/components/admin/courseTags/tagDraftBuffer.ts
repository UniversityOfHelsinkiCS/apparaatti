import { describeCurTags } from '../../../../common/courseTags.ts'
import type {
  CourseTag,
  CourseTagMode,
  CurTagMutation,
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

export interface TagDraft {
  base: TagBase
  mutations: TagMutations
}

export const emptyDraft = (base: TagBase = { kind: 'published' }): TagDraft => ({
  base,
  mutations: { tags: [], cur: [], cu: [] },
})

export const readDraft = (): TagDraft => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as TagDraft) : emptyDraft()
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
  draft.mutations.tags.length + draft.mutations.cur.length + draft.mutations.cu.length

export const baseKey = (base: TagBase): string => (base.kind === 'published' ? 'published' : `snapshot:${base.id}`)

const replaceBy = <T>(list: T[], entries: T[], identity: (entry: T) => string): T[] => {
  const byId = new Map(list.map(entry => [identity(entry), entry]))
  for (const entry of entries) {
    byId.set(identity(entry), entry)
  }
  return [...byId.values()]
}

export const withCurMutations = (draft: TagDraft, entries: CurTagMutation[]): TagDraft => ({
  ...draft,
  mutations: {
    ...draft.mutations,
    cur: replaceBy(draft.mutations.cur, entries, entry => `${entry.curId}::${entry.tagKey}`),
  },
})

export const withCuMutation = (draft: TagDraft, entry: CuTagMutation): TagDraft => ({
  ...draft,
  mutations: {
    ...draft.mutations,
    cu: replaceBy(draft.mutations.cu, [entry], mutation => `${mutation.courseCode}::${mutation.tagKey}`),
  },
})

export const withTagMutation = (draft: TagDraft, entry: TagVocabMutation): TagDraft => ({
  ...draft,
  mutations: {
    ...draft.mutations,
    tags: replaceBy(draft.mutations.tags, [entry], mutation => mutation.key),
  },
})

export const mergedVocabulary = (base: CourseTag[], mutations: TagMutations): CourseTag[] => {
  const byKey = new Map(base.map(tag => [tag.key, tag]))

  for (const mutation of mutations.tags) {
    if (mutation.op === 'delete') {
      byKey.delete(mutation.key)
    } else {
      byKey.set(mutation.key, { id: byKey.get(mutation.key)?.id ?? -1, ...mutation })
    }
  }

  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key))
}

export const curTagStates = (premises: CurTagPremises, mutations: TagMutations): Map<string, ResolvedTagSource> => {
  const inherited = new Set<string>()
  for (const cu of premises.cus) {
    const keys = new Set(cu.tagKeys)
    for (const mutation of mutations.cu) {
      if (!mutation.cuIds.includes(cu.cuId)) continue
      if (mutation.present) keys.add(mutation.tagKey)
      else keys.delete(mutation.tagKey)
    }
    for (const key of keys) inherited.add(key)
  }

  const rows = new Map(premises.rows.map(row => [row.tagKey, row.mode]))
  for (const mutation of mutations.cur) {
    if (mutation.curId !== premises.curId) continue
    if (mutation.mode === 'clear') rows.delete(mutation.tagKey)
    else rows.set(mutation.tagKey, mutation.mode)
  }

  const described = describeCurTags(
    [...inherited],
    [...rows.entries()].map(([tagKey, mode]) => ({ curId: premises.curId, tagKey, mode }))
  )

  return new Map(described.map(tag => [tag.key, tag.source]))
}

export const draftDiff = (mutations: TagMutations): TagPayloadDiff => ({
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
})

export const cuTagKeys = (courseCode: string, baseKeys: string[], mutations: TagMutations): Set<string> => {
  const keys = new Set(baseKeys)
  for (const mutation of mutations.cu) {
    if (mutation.courseCode !== courseCode) continue
    if (mutation.present) keys.add(mutation.tagKey)
    else keys.delete(mutation.tagKey)
  }
  return keys
}
