import express from 'express'
import { z } from 'zod'
import { enforceIsAdmin, enforceIsUser } from '../util/validations.ts'
import Filter from '../db/models/filter.ts'
import { FilterCreateSchema, FilterUpdateSchema } from '../../common/validators.ts'

const filterConfigRouter = express.Router()

filterConfigRouter.get('/', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)
  const filters = await Filter.findAll({
    order: [['display_order', 'ASC']],
    raw: true,
  })
  res.json(filters)
})

filterConfigRouter.put('/:id', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const filter = await Filter.findByPk(req.params.id)
  if (!filter) {
    res.status(404).json({ message: 'Filter not found' })
    return
  }

  const parsed = FilterUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  await filter.update(parsed.data)
  res.json(filter)
})

filterConfigRouter.post('/', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const parsed = FilterCreateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const existing = await Filter.findByPk(parsed.data.id)
  if (existing) {
    res.status(409).json({ message: 'A filter with this id already exists' })
    return
  }

  const filter = await Filter.create(parsed.data)
  res.status(201).json(filter)
})

filterConfigRouter.delete('/:id', async (req, res) => {
  const user = enforceIsUser(req)
  enforceIsAdmin(user)

  const filter = await Filter.findByPk(req.params.id)
  if (!filter) {
    res.status(404).json({ message: 'Filter not found' })
    return
  }

  await filter.update({ enabled: false })
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

  await Promise.all(
    parsed.data.map(({ id, displayOrder }) =>
      Filter.update({ displayOrder }, { where: { id } })
    )
  )
  res.json({ message: 'Order updated' })
})

export default filterConfigRouter
