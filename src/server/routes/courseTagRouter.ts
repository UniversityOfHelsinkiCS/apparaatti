import express from 'express'

import { diffTagPayloads } from '../../common/courseTags.ts'
import type { TagBase, TagMutations, TagSnapshotPayload } from '../../common/types.ts'
import {
  BulkApplyTagsSchema,
  TagCurStateSchema,
  TagPublishSchema,
  TagSnapshotCreateSchema,
  TagSnapshotMetaSchema,
  TagSnapshotPayloadSchema,
} from '../../common/validators.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import requireSuperuser from '../middleware/requireSuperuser.ts'
import { GIT_SHA } from '../util/config.ts'
import { courseSearchFiltersFromQuery } from '../util/courseSearchFilters.ts'
import { matchingCurIds } from '../util/dbActions/courseSearch.ts'
import { allCourseTags, courseUnitGroupsForFilters, curTagPremises } from '../util/dbActions/courseTags.ts'
import {
  allTagSnapshots,
  basePayload,
  createTagSnapshotFromPayload,
  deleteTagSnapshotById,
  mergedPayload,
  overwriteTagSnapshotPayload,
  publishedTagPayload,
  publishTagPayload,
  tagSnapshotById,
  updateTagSnapshotMeta,
} from '../util/dbActions/tagSnapshots.ts'

const courseTagRouter = express.Router()

courseTagRouter.use(requireAdmin)

const baseFromQuery = (value: unknown): TagBase => {
  const raw = String(value ?? 'published')
  if (!raw.startsWith('snapshot:')) return { kind: 'published' }
  return { kind: 'snapshot', id: Number(raw.slice('snapshot:'.length)) }
}

const resolveMerged = async (
  res: express.Response,
  base: TagBase,
  mutations: TagMutations
): Promise<TagSnapshotPayload | null> => {
  const merged = await mergedPayload(base, mutations)
  if (!merged) res.status(404).json({ message: 'Base version not found' })
  return merged
}

courseTagRouter.get('/', async (req, res) => {
  res.json(await allCourseTags())
})

courseTagRouter.post('/cur-state', async (req, res) => {
  const parsed = TagCurStateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const payload = await basePayload(parsed.data.base)
  if (!payload) {
    res.status(404).json({ message: 'Base version not found' })
    return
  }

  res.json(await curTagPremises(payload, parsed.data.curIds))
})

courseTagRouter.get('/course-units', async (req, res) => {
  const { page = '1', limit = '50' } = req.query
  const payload = await basePayload(baseFromQuery(req.query.base))
  if (!payload) {
    res.status(404).json({ message: 'Base version not found' })
    return
  }

  res.json(
    await courseUnitGroupsForFilters(
      courseSearchFiltersFromQuery(req.query as Record<string, unknown>),
      parseInt(page as string, 10),
      parseInt(limit as string, 10),
      payload
    )
  )
})

courseTagRouter.post('/bulk/preview', async (req, res) => {
  const parsed = BulkApplyTagsSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const curIds = await matchingCurIds(courseSearchFiltersFromQuery(parsed.data.filters))
  res.json({ matched: curIds.length, curIds })
})

courseTagRouter.get('/export', requireSuperuser, async (req, res) => {
  const payload = await basePayload(baseFromQuery(req.query.base))
  if (!payload) {
    res.status(404).json({ message: 'Base version not found' })
    return
  }

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

  const createdBy = (req.user as any)?.id ?? null
  const created = await createTagSnapshotFromPayload(
    `Imported ${new Date().toISOString().replace('T', ' ').slice(0, 16)}`,
    'created from an imported file',
    createdBy,
    parsed.data
  )

  res.json({ message: 'Import completed', snapshot: created })
})

courseTagRouter.post('/publish', async (req, res) => {
  const parsed = TagPublishSchema.safeParse(req.body ?? {})
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const merged = await resolveMerged(res, parsed.data.base, parsed.data.mutations)
  if (!merged) return

  const publishedBy = (req.user as any)?.id ?? null
  res.json(await publishTagPayload(merged, publishedBy, parsed.data.description))
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

  const merged = await resolveMerged(res, parsed.data.base, parsed.data.mutations)
  if (!merged) return

  const createdBy = (req.user as any)?.id ?? null
  res.status(201).json(await createTagSnapshotFromPayload(parsed.data.name, parsed.data.description, createdBy, merged))
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

  res.json(diffTagPayloads(snapshot, await publishedTagPayload()))
})

courseTagRouter.patch('/snapshots/:id', async (req, res) => {
  const parsed = TagSnapshotMetaSchema.safeParse(req.body)
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
  const parsed = TagSnapshotCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const merged = await resolveMerged(res, parsed.data.base, parsed.data.mutations)
  if (!merged) return

  const updated = await overwriteTagSnapshotPayload(Number(req.params.id), merged)
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
  res.json({ status: 'activated', results: await publishTagPayload(snapshot, activatedBy, `activated version ${id}`) })
})

courseTagRouter.delete('/snapshots/:id', requireSuperuser, async (req, res) => {
  const deleted = await deleteTagSnapshotById(Number(req.params.id))
  if (deleted === 0) {
    res.status(404).json({ message: 'Snapshot not found' })
    return
  }

  res.json({ status: 'deleted' })
})

export default courseTagRouter
