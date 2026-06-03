import express from 'express'
import { z } from 'zod'
import { enforceIsAdmin, enforceIsSuperuser, enforceIsUser } from '../util/validations.ts'
import {
  createFilterConfig,
  filterConfigWithId,
  orderedFilterConfigs,
  reorderFilterConfigs,
  updateFilterConfigById,
} from '../util/dbActions.ts'
import { FilterCreateSchema, FilterUpdateSchema } from '../../common/validators.ts'
import { seedFilterWithId } from '../db/seedFilters.ts'
import { GIT_SHA } from '../util/config.ts'

const filterConfigRouter = express.Router()

filterConfigRouter.get('/', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)
  const filters = await orderedFilterConfigs()
  res.json(filters)
})

filterConfigRouter.put('/:id', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

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
  if (parsed.data.variants.length > currentVariants.length) {
    enforceIsSuperuser(user)
  }

  const updatedFilter = await updateFilterConfigById(req.params.id, parsed.data)
  res.json(updatedFilter)
})

filterConfigRouter.post('/', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsSuperuser(user)

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
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const ReorderSchema = z.array(z.object({
    id: z.string(),
    displayOrder: z.number().int(),
  }))

  const parsed = ReorderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  await reorderFilterConfigs(parsed.data)
  res.json({ message: 'Order updated' })
})

filterConfigRouter.post('/:id/restore', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

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
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const filters = await orderedFilterConfigs()
  
  const exportData = {
    appVersion: GIT_SHA,
    exportedAt: new Date().toISOString(),
    filters,
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="filter-config-${new Date().toISOString().split('T')[0]}.json"`)
  res.json(exportData)
})

filterConfigRouter.post('/import', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const FilterImportItemSchema = FilterUpdateSchema.extend({
    id: z.string(),
    coordinateKey: z.string().nullable().optional(),
  })

  const ImportSchema = z.object({
    appVersion: z.string().optional(),
    exportedAt: z.string().optional(),
    filters: z.array(FilterImportItemSchema),
  })

  const parsed = ImportSchema.safeParse(req.body)
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
