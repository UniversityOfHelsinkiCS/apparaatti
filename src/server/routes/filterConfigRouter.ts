import express from 'express'
import { z } from 'zod'
import { enforceIsAdmin, enforceIsSuperuser, enforceIsUser } from '../util/validations.ts'
import {
  createFilterConfig,
  disableFilterConfigById,
  filterConfigWithId,
  orderedFilterConfigs,
  reorderFilterConfigs,
  updateFilterConfigById,
} from '../util/dbActions.ts'
import { FilterCreateSchema, FilterUpdateSchema } from '../../common/validators.ts'

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

filterConfigRouter.delete('/:id', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsSuperuser(user)

  const filter = await filterConfigWithId(req.params.id)
  if (!filter) {
    res.status(404).json({ message: 'Filter not found' })
    return
  }

  await disableFilterConfigById(req.params.id)
  res.json({ message: 'Filter disabled' })
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

export default filterConfigRouter
