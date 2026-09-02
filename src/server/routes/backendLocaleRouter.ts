import express from 'express'

import type { BackendLocaleValue } from '../../common/types.ts'
import {
  BackendLocaleImportSchema,
  BackendLocaleKeySchema,
  BackendLocaleKeyUpdateSchema,
  BackendLocaleValueSchema,
} from '../../common/validators.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import requireSuperuser from '../middleware/requireSuperuser.ts'
import { GIT_SHA } from '../util/config.ts'
import {
  allBackendLocaleKeys,
  backendLocaleKeyByKey,
  backendLocaleValueByDimensions,
  createBackendLocaleKey,
  createBackendLocaleValue,
  deleteBackendLocaleKey,
  deleteBackendLocaleValueById,
  updateBackendLocaleKeyDescription,
  updateBackendLocaleValueById,
} from '../util/dbActions.ts'

const backendLocaleRouter = express.Router()

backendLocaleRouter.use(requireAdmin)

const isDuplicateKeyError = (error: unknown) => String(error).includes('backend_locale_values_key_uniq')

const withoutIds = (value: BackendLocaleValue) => {
  const { id: _id, key: _key, ...rest } = value
  return rest
}

backendLocaleRouter.get('/', async (req, res) => {
  const keys = await allBackendLocaleKeys()
  res.json(keys)
})

backendLocaleRouter.get('/export', requireSuperuser, async (req, res) => {
  const keys = await allBackendLocaleKeys()

  const exportData = {
    appVersion: GIT_SHA,
    exportedAt: new Date().toISOString(),
    keys: keys.map(({ key, description, values }) => ({
      key,
      description,
      values: values.map(withoutIds),
    })),
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="backend-locales-${new Date().toISOString().split('T')[0]}.json"`
  )
  res.json(exportData)
})

backendLocaleRouter.post('/', async (req, res) => {
  const parsed = BackendLocaleKeySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const existing = await backendLocaleKeyByKey(parsed.data.key)
  if (existing) {
    res.status(409).json({ message: 'A key with this name already exists' })
    return
  }

  const created = await createBackendLocaleKey(parsed.data)
  res.status(201).json(created)
})

backendLocaleRouter.post('/import', requireSuperuser, async (req, res) => {
  const parsed = BackendLocaleImportSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid import data', errors: parsed.error.flatten() })
    return
  }

  const results = []

  for (const { key, description, values } of parsed.data.keys) {
    const existingKey = await backendLocaleKeyByKey(key)
    if (existingKey) {
      await updateBackendLocaleKeyDescription(key, description)
    } else {
      await createBackendLocaleKey({ key, description })
    }

    for (const value of values) {
      const { text: _text, ...dimensions } = value
      const existingValue = await backendLocaleValueByDimensions(key, dimensions)
      if (existingValue) {
        await updateBackendLocaleValueById(existingValue.id, value)
      } else {
        await createBackendLocaleValue(key, value)
      }
    }

    results.push({ key, status: existingKey ? 'updated' : 'created', values: values.length })
  }

  res.json({ message: 'Import completed', results })
})

backendLocaleRouter.put('/values/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid id' })
    return
  }

  const parsed = BackendLocaleValueSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  try {
    const count = await updateBackendLocaleValueById(id, parsed.data)
    if (count === 0) {
      res.status(404).json({ message: 'Text not found' })
      return
    }
    res.json({ status: 'updated' })
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error
    res.status(409).json({ message: 'A text for this combination already exists' })
  }
})

backendLocaleRouter.delete('/values/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid id' })
    return
  }

  const deleted = await deleteBackendLocaleValueById(id)
  if (deleted === 0) {
    res.status(404).json({ message: 'Text not found' })
    return
  }

  res.json({ status: 'deleted' })
})

backendLocaleRouter.put('/:key', async (req, res) => {
  const parsed = BackendLocaleKeyUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  const count = await updateBackendLocaleKeyDescription(req.params.key, parsed.data.description)
  if (count === 0) {
    res.status(404).json({ message: 'Key not found' })
    return
  }

  res.json({ status: 'updated' })
})

backendLocaleRouter.delete('/:key', async (req, res) => {
  const deleted = await deleteBackendLocaleKey(req.params.key)
  if (deleted === 0) {
    res.status(404).json({ message: 'Key not found' })
    return
  }

  res.json({ status: 'deleted' })
})

backendLocaleRouter.post('/:key/values', async (req, res) => {
  const key = await backendLocaleKeyByKey(req.params.key)
  if (!key) {
    res.status(404).json({ message: 'Key not found' })
    return
  }

  const parsed = BackendLocaleValueSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  try {
    const created = await createBackendLocaleValue(req.params.key, parsed.data)
    res.status(201).json(created)
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error
    res.status(409).json({ message: 'A text for this combination already exists' })
  }
})

export default backendLocaleRouter
