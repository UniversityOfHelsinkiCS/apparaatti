import express from 'express'
import { z } from 'zod'

import { diffFilterPayloads } from '../../common/filterWordings.ts'
import type { FilterBase, FilterConfig, User } from '../../common/types.ts'
import {
  FilterConfigImportSchema,
  FilterCreateSchema,
  FilterSnapshotCreateSchema,
  FilterSnapshotMetaSchema,
  FilterSnapshotMutateSchema,
  FilterSnapshotPayloadSchema,
  FilterUpdateSchema,
} from '../../common/validators.ts'
import { seedFilterWithId } from '../db/seedFilters.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import requireSuperuser from '../middleware/requireSuperuser.ts'
import { GIT_SHA } from '../util/config.ts'
import {
  createFilterConfig,
  filterConfigWithId,
  orderedFilterConfigs,
  reorderFilterConfigs,
  updateFilterConfigById,
} from '../util/dbActions/filterConfigs.ts'
import {
  allFilterSnapshots,
  applyMutationsToSnapshot,
  createFilterSnapshotFromPayload,
  deleteFilterSnapshotById,
  filterSnapshotById,
  mergedPayload,
  overwriteFilterSnapshotPayload,
  publishedFilterPayload,
  publishFilterPayload,
  updateFilterSnapshotMeta,
} from '../util/dbActions/filterSnapshots.ts'
import { isSuperuser } from '../util/validations.ts'

const filterConfigRouter = express.Router()

filterConfigRouter.use(requireAdmin)

filterConfigRouter.get('/', async (req, res) => {
  const filters = await orderedFilterConfigs()
  res.json(filters)
})

filterConfigRouter.get('/snapshots', async (req, res) => {
  res.json(await allFilterSnapshots())
})

filterConfigRouter.post('/snapshots', async (req, res) => {
  const parsed = FilterSnapshotCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const base = parsed.data.base as FilterBase
  const payload = await mergedPayload(base, parsed.data.mutations)
  if (!payload) {
    res.status(404).json({ message: 'Base version not found' })
    return
  }

  const created = await createFilterSnapshotFromPayload(parsed.data.name, parsed.data.description, {
    ...payload,
    appVersion: GIT_SHA,
  })
  res.status(201).json(created)
})

filterConfigRouter.get('/snapshots/:id', async (req, res) => {
  const payload = await filterSnapshotById(Number(req.params.id))
  if (!payload) {
    res.status(404).json({ message: 'Version not found' })
    return
  }

  res.json(payload)
})

filterConfigRouter.get('/snapshots/:id/config', async (req, res) => {
  const payload = await filterSnapshotById(Number(req.params.id))
  if (!payload) {
    res.status(404).json({ message: 'Version not found' })
    return
  }

  const enabled = payload.filters.filter(config => config.enabled).sort((a, b) => a.displayOrder - b.displayOrder)

  res.json(enabled)
})

filterConfigRouter.get('/snapshots/:id/diff', async (req, res) => {
  const payload = await filterSnapshotById(Number(req.params.id))
  if (!payload) {
    res.status(404).json({ message: 'Version not found' })
    return
  }

  res.json(diffFilterPayloads(payload, await publishedFilterPayload()))
})

filterConfigRouter.get('/snapshots/:id/publish-diff', async (req, res) => {
  const payload = await filterSnapshotById(Number(req.params.id))
  if (!payload) {
    res.status(404).json({ message: 'Version not found' })
    return
  }

  res.json(diffFilterPayloads(await publishedFilterPayload(), payload))
})

filterConfigRouter.patch('/snapshots/:id', async (req, res) => {
  const parsed = FilterSnapshotMetaSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const count = await updateFilterSnapshotMeta(Number(req.params.id), parsed.data.name, parsed.data.description)
  if (count === 0) {
    res.status(404).json({ message: 'Version not found' })
    return
  }

  res.json({ status: 'updated' })
})

filterConfigRouter.post('/snapshots/:id/mutate', async (req, res) => {
  const parsed = FilterSnapshotMutateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const applied = await applyMutationsToSnapshot(Number(req.params.id), parsed.data.mutations)
  if (!applied) {
    res.status(404).json({ message: 'Version not found' })
    return
  }

  res.json({ status: 'mutated' })
})

filterConfigRouter.post('/snapshots/:id/overwrite', requireSuperuser, async (req, res) => {
  const parsed = FilterSnapshotPayloadSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const payload = { ...parsed.data, filters: parsed.data.filters as FilterConfig[] }
  const count = await overwriteFilterSnapshotPayload(Number(req.params.id), payload)
  if (count === 0) {
    res.status(404).json({ message: 'Version not found' })
    return
  }

  res.json({ status: 'overwritten' })
})

filterConfigRouter.post('/snapshots/:id/activate', requireSuperuser, async (req, res) => {
  const id = Number(req.params.id)
  const payload = await filterSnapshotById(id)
  if (!payload) {
    res.status(404).json({ message: 'Version not found' })
    return
  }

  res.json({ status: 'activated', results: await publishFilterPayload(payload, id) })
})

filterConfigRouter.delete('/snapshots/:id', requireSuperuser, async (req, res) => {
  const count = await deleteFilterSnapshotById(Number(req.params.id))
  if (count === 0) {
    res.status(404).json({ message: 'Version not found' })
    return
  }

  res.json({ status: 'deleted' })
})

filterConfigRouter.put('/:id', async (req, res) => {
  const filter = await filterConfigWithId(req.params.id)
  if (!filter) {
    res.status(404).json({ message: 'Filter not found' })
    return
  }

  const parsed = FilterUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const currentVariants = ((filter as any).variants as unknown[]) ?? []
  const user = req.user as User
  if (parsed.data.variants.length > currentVariants.length && !isSuperuser(user)) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  const updatedFilter = await updateFilterConfigById(req.params.id, parsed.data)
  res.json(updatedFilter)
})

filterConfigRouter.post('/', requireSuperuser, async (req, res) => {
  const parsed = FilterCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const existing = await filterConfigWithId(parsed.data.id)
  if (existing) {
    res.status(409).json({ message: 'A filter with this id already exists' })
    return
  }

  const filter = await createFilterConfig(parsed.data)
  res.status(201).json(filter)
})

filterConfigRouter.patch('/reorder', async (req, res) => {
  const ReorderSchema = z.array(
    z.object({
      id: z.string(),
      displayOrder: z.number().int(),
    })
  )

  const parsed = ReorderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  await reorderFilterConfigs(parsed.data)
  res.json({ message: 'Order updated' })
})

filterConfigRouter.post('/:id/restore', async (req, res) => {
  const seed = seedFilterWithId(req.params.id)
  if (!seed) {
    res.status(404).json({ message: 'Seed default for filter not found' })
    return
  }

  const existingFilter = await filterConfigWithId(req.params.id)
  if (!existingFilter) {
    res.status(404).json({ message: 'Filter not found' })
    return
  }

  const restoredFilter = await updateFilterConfigById(req.params.id, {
    ...seed,
    explanation: seed.explanation ?? null,
    extraInfo: seed.extraInfo ?? null,
    parentFilterId: seed.parentFilterId ?? null,
    displayType: seed.displayType ?? null,
    coordinateKey: seed.coordinateKey ?? null,
  })

  res.json(restoredFilter)
})

filterConfigRouter.get('/export', async (req, res) => {
  const filters = await orderedFilterConfigs()

  const exportData = {
    appVersion: GIT_SHA,
    exportedAt: new Date().toISOString(),
    filters,
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="filter-config-${new Date().toISOString().split('T')[0]}.json"`
  )
  res.json(exportData)
})

filterConfigRouter.post('/import', async (req, res) => {
  const parsed = FilterConfigImportSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid import data', errors: parsed.error.flatten() })
    return
  }

  const { filters } = parsed.data
  const results = []

  for (const filterData of filters) {
    try {
      const { id, ...updateData } = filterData
      const existing = await filterConfigWithId(id)
      if (existing) {
        await updateFilterConfigById(id, updateData)
        results.push({ id, status: 'updated' })
      } else {
        results.push({ id, status: 'skipped', reason: 'Filter not found' })
      }
    } catch (error) {
      results.push({ id: filterData.id, status: 'error', error: String(error) })
    }
  }

  res.json({ message: 'Import completed', results })
})

export default filterConfigRouter
