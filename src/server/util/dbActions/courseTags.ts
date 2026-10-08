import { resolveCurTags } from '../../../common/courseTags.ts'
import type {
  CourseTag as CourseTagType,
  CourseTagMode,
  CourseUnitGroup,
  CurTagPremises,
  CurTagRow,
  CurTagState,
  CuTagRow,
  TagSnapshotPayload,
} from '../../../common/types.ts'
import CourseTag from '../../db/models/courseTag.ts'
import Cu from '../../db/models/cu.ts'
import CurCu from '../../db/models/curCu.ts'
import PublishedCuCourseTag from '../../db/models/publishedCuCourseTag.ts'
import PublishedCurCourseTag from '../../db/models/publishedCurCourseTag.ts'
import type { CourseSearchFilters, TagKeyResolver } from './courseSearch.ts'
import { matchingCurIds } from './courseSearch.ts'

export async function allCourseTags(): Promise<CourseTagType[]> {
  const rows = await CourseTag.findAll({ order: [['key', 'ASC']] })
  return rows.map(row => row.toJSON() as CourseTagType)
}

async function cuTagRowsFrom(model: any, cuIds: string[]): Promise<CuTagRow[]> {
  if (cuIds.length === 0) return []
  const rows = await model.findAll({
    where: { cuId: cuIds },
    include: [{ model: CourseTag, as: 'tag', attributes: ['key'] }],
    raw: true,
    nest: true,
  })
  return rows.map((row: any) => ({ cuId: row.cuId, tagKey: row.tag.key }))
}

async function curTagRowsFrom(model: any, curIds: string[]): Promise<CurTagRow[]> {
  if (curIds.length === 0) return []
  const rows = await model.findAll({
    where: { curId: curIds },
    include: [{ model: CourseTag, as: 'tag', attributes: ['key'] }],
    raw: true,
    nest: true,
  })
  return rows.map((row: any) => ({ curId: row.curId, tagKey: row.tag.key, mode: row.mode as CourseTagMode }))
}

async function tagStateFrom(curModel: any, cuModel: any, curIds: string[]): Promise<CurTagState> {
  const inheritedByCur = new Map<string, string[]>()
  const rowsByCur = new Map<string, CurTagRow[]>()
  if (curIds.length === 0) return { inheritedByCur, rowsByCur }

  const links = await CurCu.findAll({ where: { curId: curIds }, attributes: ['curId', 'cuId'], raw: true })
  const cuTags = await cuTagRowsFrom(cuModel, [...new Set(links.map((link: any) => link.cuId))])
  const curTags = await curTagRowsFrom(curModel, curIds)

  const keysByCu = new Map<string, string[]>()
  for (const row of cuTags) {
    keysByCu.set(row.cuId, [...(keysByCu.get(row.cuId) ?? []), row.tagKey])
  }
  for (const link of links as any[]) {
    const keys = keysByCu.get(link.cuId) ?? []
    if (keys.length > 0) {
      inheritedByCur.set(link.curId, [...new Set([...(inheritedByCur.get(link.curId) ?? []), ...keys])])
    }
  }
  for (const row of curTags) {
    rowsByCur.set(row.curId, [...(rowsByCur.get(row.curId) ?? []), row])
  }

  return { inheritedByCur, rowsByCur }
}

export async function tagStateForCurs(curIds: string[]): Promise<CurTagState> {
  return await tagStateFrom(PublishedCurCourseTag, PublishedCuCourseTag, curIds)
}

export async function curTagPremises(payload: TagSnapshotPayload, curIds: string[]): Promise<CurTagPremises[]> {
  if (curIds.length === 0) return []

  const links = await CurCu.findAll({ where: { curId: curIds }, attributes: ['curId', 'cuId'], raw: true })

  const keysByCu = new Map<string, string[]>()
  for (const row of payload.cuTags) {
    keysByCu.set(row.cuId, [...(keysByCu.get(row.cuId) ?? []), row.tagKey])
  }

  const cuIdsByCur = new Map<string, string[]>()
  for (const link of links as any[]) {
    cuIdsByCur.set(link.curId, [...(cuIdsByCur.get(link.curId) ?? []), link.cuId])
  }

  const rowsByCur = new Map<string, Omit<CurTagRow, 'curId'>[]>()
  for (const row of payload.curTags) {
    rowsByCur.set(row.curId, [...(rowsByCur.get(row.curId) ?? []), { tagKey: row.tagKey, mode: row.mode }])
  }

  return curIds.map(curId => ({
    curId,
    cus: (cuIdsByCur.get(curId) ?? []).map(cuId => ({ cuId, tagKeys: keysByCu.get(cuId) ?? [] })),
    rows: rowsByCur.get(curId) ?? [],
  }))
}

export function payloadTagKeyResolver(payload: TagSnapshotPayload): TagKeyResolver {
  return async (curIds: string[]) => {
    const premises = await curTagPremises(payload, curIds)
    const byCur = new Map<string, string[]>()

    for (const entry of premises) {
      const inherited = [...new Set(entry.cus.flatMap(cu => cu.tagKeys))]
      const rows = entry.rows.map(row => ({ curId: entry.curId, ...row }))
      byCur.set(entry.curId, resolveCurTags(inherited, rows))
    }

    return byCur
  }
}

export async function courseUnitGroupsForFilters(
  filters: CourseSearchFilters,
  page: number,
  limit: number,
  payload: TagSnapshotPayload
): Promise<{ groups: CourseUnitGroup[]; total: number; page: number; limit: number; totalPages: number }> {
  const curIds = await matchingCurIds(filters, payloadTagKeyResolver(payload))
  const links = await CurCu.findAll({ where: { curId: curIds }, attributes: ['curId', 'cuId'], raw: true })
  const cuIds = new Set(links.map((link: any) => link.cuId))
  const cus = await Cu.findAll({ where: { id: [...cuIds] }, attributes: ['id', 'courseCode', 'name'], raw: true })
  const tagRows = payload.cuTags.filter(row => cuIds.has(row.cuId))

  const codeByCuId = new Map(cus.map((cu: any) => [cu.id, cu.courseCode]))
  const groups = new Map<string, CourseUnitGroup>()
  const curIdsByCode = new Map<string, Set<string>>()

  for (const cu of cus as any[]) {
    const group = groups.get(cu.courseCode)
    if (group) {
      group.cuIds.push(cu.id)
    } else {
      groups.set(cu.courseCode, {
        courseCode: cu.courseCode,
        name: cu.name,
        cuIds: [cu.id],
        realisationCount: 0,
        tagKeys: [],
      })
    }
  }

  for (const link of links as any[]) {
    const code = codeByCuId.get(link.cuId)
    if (!code) continue
    curIdsByCode.set(code, (curIdsByCode.get(code) ?? new Set()).add(link.curId))
  }

  for (const row of tagRows) {
    const code = codeByCuId.get(row.cuId)
    const group = code ? groups.get(code) : undefined
    if (group && !group.tagKeys.includes(row.tagKey)) {
      group.tagKeys.push(row.tagKey)
    }
  }

  const ordered = [...groups.values()].sort((a, b) => a.courseCode.localeCompare(b.courseCode))
  for (const group of ordered) {
    group.realisationCount = curIdsByCode.get(group.courseCode)?.size ?? 0
  }

  const offset = (page - 1) * limit
  return {
    groups: ordered.slice(offset, offset + limit),
    total: ordered.length,
    page,
    limit,
    totalPages: Math.ceil(ordered.length / limit),
  }
}
