import express from 'express'

import { RecommendationCodeImportSchema, RecommendationCodeSchema } from '../../common/validators.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import requireSuperuser from '../middleware/requireSuperuser.ts'
import { GIT_SHA } from '../util/config.ts'
import {
  allRecommendationCodes,
  allRecommendationLanguages,
  createRecommendationCode,
  createRecommendationLanguage,
  deleteRecommendationCodeById,
  updateRecommendationCodeById,
  updateRecommendationLanguageById,
} from '../util/dbActions.ts'
import { loadRecommendationCodes } from '../util/recommendationCodeCache.ts'

const recommendationCodeRouter = express.Router()

recommendationCodeRouter.use(requireAdmin)

const isDuplicateCodeError = (error: any) => error?.parent?.constraint === 'recommendation_codes_uniq'

recommendationCodeRouter.get('/', async (req, res) => {
  const codes = await allRecommendationCodes()
  res.json(codes)
})

recommendationCodeRouter.get('/export', requireSuperuser, async (req, res) => {
  const languages = await allRecommendationLanguages()
  const codes = await allRecommendationCodes()

  const exportData = {
    appVersion: GIT_SHA,
    exportedAt: new Date().toISOString(),
    languages,
    codes: codes.map(({ organisationCode, languageId, courseCode }) => ({
      organisationCode,
      languageId,
      courseCode,
    })),
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="recommendation-codes-${new Date().toISOString().split('T')[0]}.json"`
  )
  res.json(exportData)
})

recommendationCodeRouter.post('/', async (req, res) => {
  const parsed = RecommendationCodeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  try {
    const created = await createRecommendationCode(parsed.data)
    await loadRecommendationCodes()
    res.status(201).json(created)
  } catch (error) {
    if (!isDuplicateCodeError(error)) throw error
    res.status(409).json({ message: 'This course code is already added for that organisation and language' })
  }
})

recommendationCodeRouter.post('/import', requireSuperuser, async (req, res) => {
  const parsed = RecommendationCodeImportSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid import data', errors: parsed.error.flatten() })
    return
  }

  const existingLanguages = await allRecommendationLanguages()

  for (const { id, ...language } of parsed.data.languages) {
    const existing = existingLanguages.find(candidate => candidate.id === id)
    if (existing) {
      await updateRecommendationLanguageById(id, language)
    } else {
      await createRecommendationLanguage({ id, ...language })
    }
  }

  let created = 0
  for (const code of parsed.data.codes) {
    try {
      await createRecommendationCode(code)
      created += 1
    } catch (error) {
      if (!isDuplicateCodeError(error)) throw error
    }
  }

  await loadRecommendationCodes()
  res.json({
    message: 'Import completed',
    results: { languages: parsed.data.languages.length, codes: created, skipped: parsed.data.codes.length - created },
  })
})

recommendationCodeRouter.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid id' })
    return
  }

  const parsed = RecommendationCodeSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  try {
    const count = await updateRecommendationCodeById(id, parsed.data)
    if (count === 0) {
      res.status(404).json({ message: 'Course code not found' })
      return
    }
    await loadRecommendationCodes()
    res.json({ status: 'updated' })
  } catch (error) {
    if (!isDuplicateCodeError(error)) throw error
    res.status(409).json({ message: 'This course code is already added for that organisation and language' })
  }
})

recommendationCodeRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid id' })
    return
  }

  const deleted = await deleteRecommendationCodeById(id)
  if (deleted === 0) {
    res.status(404).json({ message: 'Course code not found' })
    return
  }

  await loadRecommendationCodes()
  res.json({ status: 'deleted' })
})

export default recommendationCodeRouter
