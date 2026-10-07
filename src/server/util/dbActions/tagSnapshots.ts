import { Op } from 'sequelize'

import { mergeTagMutations } from '../../../common/courseTags.ts'
import type {
  CourseTagMode,
  TagBase,
  TagMutations,
  TagSnapshotMeta,
  TagSnapshotPayload,
} from '../../../common/types.ts'
import { sequelize } from '../../db/connection.ts'
import CourseTag from '../../db/models/courseTag.ts'
import PublishedCuCourseTag from '../../db/models/publishedCuCourseTag.ts'
import PublishedCurCourseTag from '../../db/models/publishedCurCourseTag.ts'
import TagSnapshot from '../../db/models/tagSnapshot.ts'
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

export async function publishedTagPayload(): Promise<TagSnapshotPayload> {
  return await tagPayloadFrom(PublishedCurCourseTag, PublishedCuCourseTag)
}

export async function basePayload(base: TagBase): Promise<TagSnapshotPayload | null> {
  if (base.kind === 'published') return await publishedTagPayload()
  return await tagSnapshotById(base.id)
}

export async function mergedPayload(base: TagBase, mutations: TagMutations): Promise<TagSnapshotPayload | null> {
  const payload = await basePayload(base)
  return payload ? mergeTagMutations(payload, mutations) : null
}

export async function publishTagPayload(
  payload: TagSnapshotPayload,
  publishedBy: string | null,
  description: string | null = null
): Promise<{ tags: number; cuTags: number; curTags: number }> {
  return await sequelize.transaction(async transaction => {
    for (const tag of payload.tags) {
      const [row, created] = await CourseTag.findOrCreate({
        where: { key: tag.key },
        defaults: tag as any,
        transaction,
      })
      if (!created) await row.update({ description: tag.description } as any, { transaction })
    }

    await PublishedCurCourseTag.destroy({ where: {}, transaction })
    await PublishedCuCourseTag.destroy({ where: {}, transaction })
    await CourseTag.destroy({ where: { key: { [Op.notIn]: payload.tags.map(tag => tag.key) } }, transaction })

    const tagRows = await CourseTag.findAll({ attributes: ['id', 'key'], raw: true, transaction })
    const idByKey = new Map(tagRows.map((row: any) => [row.key, row.id]))

    const cuRows = payload.cuTags
      .filter(row => idByKey.has(row.tagKey))
      .map(row => ({ cuId: row.cuId, courseTagId: idByKey.get(row.tagKey) }))
    const curRows = payload.curTags
      .filter(row => idByKey.has(row.tagKey))
      .map(row => ({ curId: row.curId, courseTagId: idByKey.get(row.tagKey), mode: row.mode }))

    await PublishedCuCourseTag.bulkCreate(cuRows as any, { ignoreDuplicates: true, transaction })
    await PublishedCurCourseTag.bulkCreate(curRows as any, { ignoreDuplicates: true, transaction })

    await TagSnapshot.create(
      {
        name: `${AUTO_SNAPSHOT_NAME_PREFIX} ${new Date().toISOString().replace('T', ' ').slice(0, 16)}`,
        description: description ?? `${curRows.length} realisation and ${cuRows.length} course unit assignments`,
        createdBy: publishedBy,
        payload,
      } as any,
      { transaction }
    )

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

export async function createTagSnapshotFromPayload(
  name: string,
  description: string | null,
  createdBy: string | null,
  payload: TagSnapshotPayload
): Promise<TagSnapshotMeta> {
  const created = await TagSnapshot.create({ name, description, createdBy, payload } as any)
  return created.toJSON() as TagSnapshotMeta
}

export async function updateTagSnapshotMeta(id: number, name: string, description: string | null): Promise<number> {
  const [count] = await TagSnapshot.update({ name, description } as any, { where: { id } })
  return count
}

export async function overwriteTagSnapshotPayload(id: number, payload: TagSnapshotPayload): Promise<number> {
  const [count] = await TagSnapshot.update({ payload } as any, { where: { id } })
  return count
}

export async function deleteTagSnapshotById(id: number): Promise<number> {
  return await TagSnapshot.destroy({ where: { id } })
}
