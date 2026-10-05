import express from 'express'

import type { CourseTagMode } from '../../common/types.ts'
import {
  BulkApplyTagsSchema,
  CourseTagSchema,
  CurTagMutationSchema,
  CuTagMutationSchema,
  TagPublishSchema,
  TagSnapshotCreateSchema,
  TagSnapshotPayloadSchema,
} from '../../common/validators.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import requireSuperuser from '../middleware/requireSuperuser.ts'
import { GIT_SHA } from '../util/config.ts'
import { courseSearchFiltersFromQuery } from '../util/courseSearchFilters.ts'
import { describeCurTags, diffTagPayloads } from '../util/courseTags.ts'
import {
  allCourseTags,
  allTagSnapshots,
  bulkApplyTagsToFilter,
  clearCurTag,
  courseUnitGroupsForFilters,
  createCourseTag,
  createTagSnapshot,
  deleteCourseTagById,
  deleteTagSnapshotById,
  discardTagDraft,
  draftTagStateForCurs,
  fullTagPayload,
  matchingCurIds,
  overwriteTagSnapshotPayload,
  pendingTagChanges,
  publishTagState,
  replaceTagState,
  setCourseUnitGroupTag,
  setCurTag,
  tagSnapshotById,
  updateCourseTagById,
  updateTagSnapshotMeta,
} from '../util/dbActions.ts'

const courseTagRouter = express.Router()

courseTagRouter.use(requireAdmin)

const isDuplicateTagError = (error: any) => error?.parent?.constraint === 'course_tags_key_uniq'

const parseCsvIds = (value: unknown): string[] =>
  String(value ?? '')
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)

courseTagRouter.get('/', async (req, res) => {
  res.json(await allCourseTags())
})

courseTagRouter.post('/', async (req, res) => {
  const parsed = CourseTagSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  try {
    res.status(201).json(await createCourseTag(parsed.data))
  } catch (error) {
    if (!isDuplicateTagError(error)) throw error
    res.status(409).json({ message: 'A tag with this key already exists' })
  }
})

courseTagRouter.get('/cur-state', async (req, res) => {
  const curIds = parseCsvIds(req.query.curIds)
  const tagging = await draftTagStateForCurs(curIds)

  res.json(
    curIds.map(curId => ({
      curId,
      tags: describeCurTags(tagging.inheritedByCur.get(curId) ?? [], tagging.rowsByCur.get(curId) ?? []),
    }))
  )
})

courseTagRouter.put('/cur/:curId', async (req, res) => {
  const parsed = CurTagMutationSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const { tagKey, mode } = parsed.data
  if (mode === 'clear') {
    await clearCurTag(req.params.curId, tagKey)
  } else {
    await setCurTag(req.params.curId, tagKey, mode as CourseTagMode)
  }

  res.json({ status: 'updated' })
})

courseTagRouter.get('/course-units', async (req, res) => {
  const { page = '1', limit = '50' } = req.query
  const result = await courseUnitGroupsForFilters(
    courseSearchFiltersFromQuery(req.query as Record<string, unknown>),
    parseInt(page as string, 10),
    parseInt(limit as string, 10)
  )

  res.json(result)
})

courseTagRouter.put('/course-unit/:courseCode', async (req, res) => {
  const parsed = CuTagMutationSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const changed = await setCourseUnitGroupTag(req.params.courseCode, parsed.data.tagKey, parsed.data.present)
  res.json({ status: 'updated', changed })
})

courseTagRouter.post('/bulk/preview', async (req, res) => {
  const parsed = BulkApplyTagsSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const curIds = await matchingCurIds(courseSearchFiltersFromQuery(parsed.data.filters))
  res.json({ matched: curIds.length })
})

courseTagRouter.post('/bulk', async (req, res) => {
  const parsed = BulkApplyTagsSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const { filters, tagKeys, mode } = parsed.data
  const result = await bulkApplyTagsToFilter(courseSearchFiltersFromQuery(filters), tagKeys, mode)
  res.json(result)
})

courseTagRouter.get('/export', requireSuperuser, async (req, res) => {
  const payload = await fullTagPayload()

  res.setHeader('Content-Type', 'application/json')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="course-tags-${new Date().toISOString().split('T')[0]}.json"`
  )
  res.json({ ...payload, appVersion: GIT_SHA })
})

courseTagRouter.post('/import', requireSuperuser, async (req, res) => {
  const parsed = TagSnapshotPayloadSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid import data', errors: parsed.error.flatten() })
    return
  }

  res.json({ message: 'Import completed', results: await replaceTagState(parsed.data) })
})

courseTagRouter.get('/pending', async (req, res) => {
  res.json(await pendingTagChanges())
})

courseTagRouter.post('/publish', async (req, res) => {
  const parsed = TagPublishSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const publishedBy = (req.user as any)?.id ?? null
  res.json(await publishTagState(publishedBy, parsed.data.description))
})

courseTagRouter.post('/discard', async (req, res) => {
  res.json(await discardTagDraft())
})

courseTagRouter.get('/snapshots', async (req, res) => {
  res.json(await allTagSnapshots())
})

courseTagRouter.post('/snapshots', async (req, res) => {
  const parsed = TagSnapshotCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const createdBy = (req.user as any)?.id ?? null
  res.status(201).json(await createTagSnapshot(parsed.data.name, parsed.data.description, createdBy))
})

courseTagRouter.get('/snapshots/:id', async (req, res) => {
  const payload = await tagSnapshotById(Number(req.params.id))
  if (!payload) {
    res.status(404).json({ message: 'Snapshot not found' })
    return
  }

  res.json(payload)
})

courseTagRouter.get('/snapshots/:id/diff', async (req, res) => {
  const snapshot = await tagSnapshotById(Number(req.params.id))
  if (!snapshot) {
    res.status(404).json({ message: 'Snapshot not found' })
    return
  }

  res.json(diffTagPayloads(snapshot, await fullTagPayload()))
})

courseTagRouter.post('/snapshots/:id/restore', requireSuperuser, async (req, res) => {
  const id = Number(req.params.id)
  const payload = await tagSnapshotById(id)
  if (!payload) {
    res.status(404).json({ message: 'Snapshot not found' })
    return
  }

  const createdBy = (req.user as any)?.id ?? null
  await createTagSnapshot(`before restore of snapshot ${id}`, 'automatic backup taken before a restore', createdBy)
  res.json({ status: 'restored', results: await replaceTagState(payload) })
})

courseTagRouter.patch('/snapshots/:id', async (req, res) => {
  const parsed = TagSnapshotCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const updated = await updateTagSnapshotMeta(Number(req.params.id), parsed.data.name, parsed.data.description)
  if (updated === 0) {
    res.status(404).json({ message: 'Snapshot not found' })
    return
  }

  res.json({ status: 'updated' })
})

courseTagRouter.post('/snapshots/:id/overwrite', requireSuperuser, async (req, res) => {
  const updated = await overwriteTagSnapshotPayload(Number(req.params.id))
  if (updated === 0) {
    res.status(404).json({ message: 'Snapshot not found' })
    return
  }

  res.json({ status: 'overwritten' })
})

courseTagRouter.post('/snapshots/:id/activate', requireSuperuser, async (req, res) => {
  const id = Number(req.params.id)
  const snapshot = await tagSnapshotById(id)
  if (!snapshot) {
    res.status(404).json({ message: 'Snapshot not found' })
    return
  }

  const activatedBy = (req.user as any)?.id ?? null
  await createTagSnapshot(
    `before activating snapshot ${id}`,
    'automatic backup taken before an activation',
    activatedBy
  )
  const results = await replaceTagState(snapshot)
  await publishTagState(activatedBy, `activated from snapshot ${id}`)
  res.json({ status: 'activated', results })
})

courseTagRouter.delete('/snapshots/:id', requireSuperuser, async (req, res) => {
  const deleted = await deleteTagSnapshotById(Number(req.params.id))
  if (deleted === 0) {
    res.status(404).json({ message: 'Snapshot not found' })
    return
  }

  res.json({ status: 'deleted' })
})

courseTagRouter.put('/:id', async (req, res) => {
  const parsed = CourseTagSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  try {
    const count = await updateCourseTagById(Number(req.params.id), parsed.data)
    if (count === 0) {
      res.status(404).json({ message: 'Tag not found' })
      return
    }
    res.json({ status: 'updated' })
  } catch (error) {
    if (!isDuplicateTagError(error)) throw error
    res.status(409).json({ message: 'A tag with this key already exists' })
  }
})

courseTagRouter.delete('/:id', requireSuperuser, async (req, res) => {
  const deleted = await deleteCourseTagById(Number(req.params.id))
  if (deleted === 0) {
    res.status(404).json({ message: 'Tag not found' })
    return
  }

  res.json({ status: 'deleted' })
})

export default courseTagRouter
