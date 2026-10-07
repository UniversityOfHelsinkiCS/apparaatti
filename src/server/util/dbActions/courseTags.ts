import type {
  CourseTag as CourseTagType,
  CourseTagMode,
  CourseUnitGroup,
  CurTagRow,
  CurTagState,
  CuTagRow,
} from '../../../common/types.ts'
import CourseTag from '../../db/models/courseTag.ts'
import Cu from '../../db/models/cu.ts'
import CuCourseTag from '../../db/models/cuCourseTag.ts'
import CurCourseTag from '../../db/models/curCourseTag.ts'
import CurCu from '../../db/models/curCu.ts'
import PublishedCuCourseTag from '../../db/models/publishedCuCourseTag.ts'
import PublishedCurCourseTag from '../../db/models/publishedCurCourseTag.ts'
import type { CourseSearchFilters } from './courseSearch.ts'
import { matchingCurIds } from './courseSearch.ts'

const BULK_TAG_CHUNK = 100

export async function allCourseTags(): Promise<CourseTagType[]> {
  const rows = await CourseTag.findAll({ order: [['key', 'ASC']] })
  return rows.map(row => row.toJSON() as CourseTagType)
}

export async function createCourseTag(data: object): Promise<CourseTagType> {
  const created = await CourseTag.create(data as any)
  return created.toJSON() as CourseTagType
}

export async function updateCourseTagById(id: number, data: object): Promise<number> {
  const [count] = await CourseTag.update(data as any, { where: { id } })
  return count
}

export async function deleteCourseTagById(id: number): Promise<number> {
  return await CourseTag.destroy({ where: { id } })
}

async function tagIdsByKey(): Promise<Map<string, number>> {
  const rows = await CourseTag.findAll({ attributes: ['id', 'key'], raw: true })
  return new Map(rows.map((row: any) => [row.key, row.id]))
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

export async function cuTagRowsForCus(cuIds: string[]): Promise<CuTagRow[]> {
  return await cuTagRowsFrom(CuCourseTag, cuIds)
}

export async function curTagRowsForCurs(curIds: string[]): Promise<CurTagRow[]> {
  return await curTagRowsFrom(CurCourseTag, curIds)
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

export async function draftTagStateForCurs(curIds: string[]): Promise<CurTagState> {
  return await tagStateFrom(CurCourseTag, CuCourseTag, curIds)
}

export async function setCurTag(curId: string, tagKey: string, mode: CourseTagMode): Promise<void> {
  await bulkSetCurTags([curId], [tagKey], mode)
}

export async function clearCurTag(curId: string, tagKey: string): Promise<number> {
  return await bulkClearCurTags([curId], [tagKey])
}

export async function bulkSetCurTags(curIds: string[], tagKeys: string[], mode: CourseTagMode): Promise<number> {
  const tagIds = await tagIdsByKey()
  const wantedTagIds = tagKeys.map(key => tagIds.get(key)).filter(id => id !== undefined)
  if (curIds.length === 0 || wantedTagIds.length === 0) return 0

  const rows = curIds.flatMap(curId => wantedTagIds.map(courseTagId => ({ curId, courseTagId, mode })))
  for (let start = 0; start < rows.length; start += BULK_TAG_CHUNK) {
    await CurCourseTag.bulkCreate(rows.slice(start, start + BULK_TAG_CHUNK) as any, {
      updateOnDuplicate: ['mode', 'updatedAt'],
    })
  }
  return rows.length
}

export async function bulkClearCurTags(curIds: string[], tagKeys: string[]): Promise<number> {
  const tagIds = await tagIdsByKey()
  const wantedTagIds = tagKeys.map(key => tagIds.get(key)).filter(id => id !== undefined)
  if (curIds.length === 0 || wantedTagIds.length === 0) return 0

  return await CurCourseTag.destroy({ where: { curId: curIds, courseTagId: wantedTagIds } })
}

export async function setCuTag(cuId: string, tagKey: string, present: boolean): Promise<void> {
  const tagIds = await tagIdsByKey()
  const courseTagId = tagIds.get(tagKey)
  if (courseTagId === undefined) return

  if (present) {
    await CuCourseTag.findOrCreate({ where: { cuId, courseTagId } })
    return
  }
  await CuCourseTag.destroy({ where: { cuId, courseTagId } })
}

export async function bulkApplyTagsToFilter(
  filters: CourseSearchFilters,
  tagKeys: string[],
  mode: CourseTagMode | 'clear'
): Promise<{ matched: number; changed: number }> {
  const curIds = await matchingCurIds(filters)
  const changed =
    mode === 'clear' ? await bulkClearCurTags(curIds, tagKeys) : await bulkSetCurTags(curIds, tagKeys, mode)
  return { matched: curIds.length, changed }
}

export async function courseUnitGroupsForFilters(
  filters: CourseSearchFilters,
  page: number,
  limit: number
): Promise<{ groups: CourseUnitGroup[]; total: number; page: number; limit: number; totalPages: number }> {
  const curIds = await matchingCurIds(filters)
  const links = await CurCu.findAll({ where: { curId: curIds }, attributes: ['curId', 'cuId'], raw: true })
  const cuIds = [...new Set(links.map((link: any) => link.cuId))]
  const cus = await Cu.findAll({ where: { id: cuIds }, attributes: ['id', 'courseCode', 'name'], raw: true })
  const tagRows = await cuTagRowsForCus(cuIds)

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

export async function setCourseUnitGroupTag(courseCode: string, tagKey: string, present: boolean): Promise<number> {
  const tagIds = await tagIdsByKey()
  const courseTagId = tagIds.get(tagKey)
  if (courseTagId === undefined) return 0

  const cus = await Cu.findAll({ where: { courseCode }, attributes: ['id'], raw: true })
  const cuIds = cus.map((cu: any) => cu.id)
  if (cuIds.length === 0) return 0

  if (!present) {
    return await CuCourseTag.destroy({ where: { cuId: cuIds, courseTagId } })
  }

  await CuCourseTag.bulkCreate(cuIds.map(cuId => ({ cuId, courseTagId })) as any, { ignoreDuplicates: true })
  return cuIds.length
}
