import type { CourseTagMode, TagPayloadDiff, TagSnapshotMeta, TagSnapshotPayload } from '../../../common/types.ts'
import { sequelize } from '../../db/connection.ts'
import CourseTag from '../../db/models/courseTag.ts'
import CuCourseTag from '../../db/models/cuCourseTag.ts'
import CurCourseTag from '../../db/models/curCourseTag.ts'
import PublishedCuCourseTag from '../../db/models/publishedCuCourseTag.ts'
import PublishedCurCourseTag from '../../db/models/publishedCurCourseTag.ts'
import TagSnapshot from '../../db/models/tagSnapshot.ts'
import { diffTagPayloads } from '../courseTags.ts'
import { allCourseTags } from './courseTags.ts'

const AUTO_SNAPSHOT_NAME_PREFIX = 'Applied'

async function tagPayloadFrom(curModel: any, cuModel: any): Promise<TagSnapshotPayload> {
  const tags = await allCourseTags()
  const cuRows = await cuModel.findAll({
    include: [{ model: CourseTag, as: 'tag', attributes: ['key'] }],
    raw: true,
    nest: true,
  })
  const curRows = await curModel.findAll({
    include: [{ model: CourseTag, as: 'tag', attributes: ['key'] }],
    raw: true,
    nest: true,
  })

  return {
    exportedAt: new Date().toISOString(),
    tags: tags.map(({ key, description }) => ({ key, description })),
    cuTags: cuRows.map((row: any) => ({ cuId: row.cuId, tagKey: row.tag.key })),
    curTags: curRows.map((row: any) => ({ curId: row.curId, tagKey: row.tag.key, mode: row.mode as CourseTagMode })),
  }
}

export async function fullTagPayload(): Promise<TagSnapshotPayload> {
  return await tagPayloadFrom(CurCourseTag, CuCourseTag)
}

export async function publishedTagPayload(): Promise<TagSnapshotPayload> {
  return await tagPayloadFrom(PublishedCurCourseTag, PublishedCuCourseTag)
}

export async function pendingTagChanges(): Promise<TagPayloadDiff> {
  return diffTagPayloads(await publishedTagPayload(), await fullTagPayload())
}

export async function publishTagState(
  publishedBy: string | null,
  description: string | null = null
): Promise<{ cuTags: number; curTags: number }> {
  return await sequelize.transaction(async transaction => {
    await PublishedCurCourseTag.destroy({ where: {}, transaction })
    await PublishedCuCourseTag.destroy({ where: {}, transaction })

    const cuRows = await CuCourseTag.findAll({ attributes: ['cuId', 'courseTagId'], raw: true, transaction })
    const curRows = await CurCourseTag.findAll({ attributes: ['curId', 'courseTagId', 'mode'], raw: true, transaction })

    await PublishedCuCourseTag.bulkCreate(cuRows as any, { transaction })
    await PublishedCurCourseTag.bulkCreate(curRows as any, { transaction })

    const payload = await tagPayloadFrom(CurCourseTag, CuCourseTag)
    await TagSnapshot.create(
      {
        name: `${AUTO_SNAPSHOT_NAME_PREFIX} ${new Date().toISOString().replace('T', ' ').slice(0, 16)}`,
        description: description ?? `${curRows.length} realisation and ${cuRows.length} course unit assignments`,
        createdBy: publishedBy,
        payload,
      } as any,
      { transaction }
    )

    return { cuTags: cuRows.length, curTags: curRows.length }
  })
}

export async function discardTagDraft(): Promise<{ cuTags: number; curTags: number }> {
  return await sequelize.transaction(async transaction => {
    await CurCourseTag.destroy({ where: {}, transaction })
    await CuCourseTag.destroy({ where: {}, transaction })

    const cuRows = await PublishedCuCourseTag.findAll({ attributes: ['cuId', 'courseTagId'], raw: true, transaction })
    const curRows = await PublishedCurCourseTag.findAll({
      attributes: ['curId', 'courseTagId', 'mode'],
      raw: true,
      transaction,
    })

    await CuCourseTag.bulkCreate(cuRows as any, { transaction })
    await CurCourseTag.bulkCreate(curRows as any, { transaction })

    return { cuTags: cuRows.length, curTags: curRows.length }
  })
}

export async function replaceTagState(
  payload: TagSnapshotPayload
): Promise<{ tags: number; cuTags: number; curTags: number }> {
  return await sequelize.transaction(async transaction => {
    await CurCourseTag.destroy({ where: {}, transaction })
    await CuCourseTag.destroy({ where: {}, transaction })

    for (const tag of payload.tags) {
      await CourseTag.upsert(tag as any, { transaction })
    }

    const tagRows = await CourseTag.findAll({ attributes: ['id', 'key'], raw: true, transaction })
    const idByKey = new Map(tagRows.map((row: any) => [row.key, row.id]))

    const cuRows = payload.cuTags
      .filter(row => idByKey.has(row.tagKey))
      .map(row => ({ cuId: row.cuId, courseTagId: idByKey.get(row.tagKey) }))
    const curRows = payload.curTags
      .filter(row => idByKey.has(row.tagKey))
      .map(row => ({ curId: row.curId, courseTagId: idByKey.get(row.tagKey), mode: row.mode }))

    await CuCourseTag.bulkCreate(cuRows as any, { ignoreDuplicates: true, transaction })
    await CurCourseTag.bulkCreate(curRows as any, { ignoreDuplicates: true, transaction })

    return { tags: payload.tags.length, cuTags: cuRows.length, curTags: curRows.length }
  })
}

export async function allTagSnapshots(): Promise<TagSnapshotMeta[]> {
  const rows = await TagSnapshot.findAll({
    attributes: ['id', 'name', 'description', 'createdBy', 'createdAt'],
    order: [['createdAt', 'DESC']],
    raw: true,
  })
  return rows as unknown as TagSnapshotMeta[]
}

export async function tagSnapshotById(id: number): Promise<TagSnapshotPayload | null> {
  const row = await TagSnapshot.findByPk(id)
  return row ? ((row.get('payload') as TagSnapshotPayload) ?? null) : null
}

export async function createTagSnapshot(
  name: string,
  description: string | null,
  createdBy: string | null
): Promise<TagSnapshotMeta> {
  const payload = await fullTagPayload()
  const created = await TagSnapshot.create({ name, description, createdBy, payload } as any)
  return created.toJSON() as TagSnapshotMeta
}

export async function updateTagSnapshotMeta(id: number, name: string, description: string | null): Promise<number> {
  const [count] = await TagSnapshot.update({ name, description } as any, { where: { id } })
  return count
}

export async function overwriteTagSnapshotPayload(id: number): Promise<number> {
  const payload = await fullTagPayload()
  const [count] = await TagSnapshot.update({ payload } as any, { where: { id } })
  return count
}

export async function deleteTagSnapshotById(id: number): Promise<number> {
  return await TagSnapshot.destroy({ where: { id } })
}
