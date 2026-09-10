import express from 'express'

import { RecommendationLanguageSchema } from '../../common/validators.ts'
import requireAdmin from '../middleware/requireAdmin.ts'
import requireSuperuser from '../middleware/requireSuperuser.ts'
import {
  allRecommendationLanguages,
  countCodesForRecommendationLanguage,
  createRecommendationLanguage,
  deleteRecommendationLanguageById,
  updateRecommendationLanguageById,
} from '../util/dbActions.ts'
import { loadRecommendationCodes } from '../util/recommendationCodeCache.ts'

const recommendationLanguageRouter = express.Router()

recommendationLanguageRouter.use(requireAdmin)

const isDuplicateLanguageError = (error: any) => error?.parent?.constraint === 'recommendation_languages_uniq'

recommendationLanguageRouter.get('/', async (req, res) => {
  const languages = await allRecommendationLanguages()
  res.json(languages)
})

recommendationLanguageRouter.post('/', requireSuperuser, async (req, res) => {
  const parsed = RecommendationLanguageSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  try {
    const created = await createRecommendationLanguage(parsed.data)
    await loadRecommendationCodes()
    res.status(201).json(created)
  } catch (error) {
    if (!isDuplicateLanguageError(error)) throw error
    res.status(409).json({ message: 'A language with this combination already exists' })
  }
})

recommendationLanguageRouter.put('/:id', requireSuperuser, async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid id' })
    return
  }

  const parsed = RecommendationLanguageSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid data', errors: parsed.error.flatten() })
    return
  }

  try {
    const count = await updateRecommendationLanguageById(id, parsed.data)
    if (count === 0) {
      res.status(404).json({ message: 'Language not found' })
      return
    }
    await loadRecommendationCodes()
    res.json({ status: 'updated' })
  } catch (error) {
    if (!isDuplicateLanguageError(error)) throw error
    res.status(409).json({ message: 'A language with this combination already exists' })
  }
})

recommendationLanguageRouter.delete('/:id', requireSuperuser, async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    res.status(400).json({ message: 'Invalid id' })
    return
  }

  const codeCount = await countCodesForRecommendationLanguage(id)
  if (codeCount > 0) {
    res.status(409).json({ message: `This language still has ${codeCount} course codes` })
    return
  }

  const deleted = await deleteRecommendationLanguageById(id)
  if (deleted === 0) {
    res.status(404).json({ message: 'Language not found' })
    return
  }

  await loadRecommendationCodes()
  res.json({ status: 'deleted' })
})

export default recommendationLanguageRouter
