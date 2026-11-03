import { describeCurTags } from '../../../../common/courseTags.ts'
import type { CurTagPremises, TagBase, TagMutations } from '../../../../common/types.ts'
import type { TagCellState } from './TagMark.tsx'

const EDITING_VERSION_KEY = 'apparaatti-course-tag-version'

export const readEditingVersionId = (): number | null => {
  try {
    const stored = window.localStorage.getItem(EDITING_VERSION_KEY)
    if (!stored) return null

    const parsed = Number(stored)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  } catch {
    return null
  }
}

export const storeEditingVersionId = (id: number | null) => {
  try {
    if (id === null) window.localStorage.removeItem(EDITING_VERSION_KEY)
    else window.localStorage.setItem(EDITING_VERSION_KEY, String(id))
  } catch {
    return
  }
}

export const baseKey = (base: TagBase): string => (base.kind === 'published' ? 'published' : `snapshot:${base.id}`)

export const unsetCell: TagCellState = { apparaatti: null, fromCustomCodeUrn: false, ignored: false }

export const addedCell: TagCellState = { apparaatti: 'added', fromCustomCodeUrn: false, ignored: false }

export const curTagStates = (premises: CurTagPremises): Map<string, TagCellState> => {
  const inherited = [...new Set(premises.cus.flatMap(cu => cu.tagKeys))]
  const described = describeCurTags(
    inherited,
    premises.rows.map(row => ({ curId: premises.curId, tagKey: row.tagKey, mode: row.mode })),
    premises.customCodeUrnKeys
  )

  return new Map(
    described.map(tag => [
      tag.key,
      { apparaatti: tag.apparaatti, fromCustomCodeUrn: tag.fromCustomCodeUrn, ignored: tag.ignored },
    ])
  )
}

const withCuMutations = (premises: CurTagPremises, mutations: TagMutations): CurTagPremises['cus'] =>
  premises.cus.map(cu => {
    const keys = new Set(cu.tagKeys)
    for (const mutation of mutations.cu) {
      if (!mutation.cuIds.includes(cu.cuId)) continue
      if (mutation.present) keys.add(mutation.tagKey)
      else keys.delete(mutation.tagKey)
    }
    return { cuId: cu.cuId, tagKeys: [...keys] }
  })

const withCurMutations = (premises: CurTagPremises, mutations: TagMutations): CurTagPremises['rows'] => {
  const rows = new Map(premises.rows.map(row => [row.tagKey, row.mode]))

  for (const mutation of mutations.cur) {
    if (mutation.curId !== premises.curId) continue
    if (mutation.mode === 'clear') rows.delete(mutation.tagKey)
    else rows.set(mutation.tagKey, mutation.mode)
  }

  return [...rows.entries()].map(([tagKey, mode]) => ({ tagKey, mode }))
}

export const applyMutationsToPremises = (entries: CurTagPremises[], mutations: TagMutations): CurTagPremises[] => {
  const deletedKeys = new Set(mutations.tags.filter(tag => tag.op === 'delete').map(tag => tag.key))

  return entries.map(entry => ({
    curId: entry.curId,
    cus: withCuMutations(entry, mutations).map(cu => ({
      cuId: cu.cuId,
      tagKeys: cu.tagKeys.filter(key => !deletedKeys.has(key)),
    })),
    rows: withCurMutations(entry, mutations).filter(row => !deletedKeys.has(row.tagKey)),
    customCodeUrnKeys: entry.customCodeUrnKeys.filter(key => !deletedKeys.has(key)),
  }))
}
