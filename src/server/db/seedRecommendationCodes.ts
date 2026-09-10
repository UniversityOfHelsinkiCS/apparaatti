import logger from '../util/logger.ts'
import RecommendationCode from './models/recommendationCode.ts'
import RecommendationLanguage from './models/recommendationLanguage.ts'
import { generatedCodes, RECOMMENDATION_LANGUAGE_SEEDS } from './recommendationCodeSeeds.ts'

export async function seedRecommendationCodes() {
  logger.info('Seeding recommendation codes...')
  const existing = await RecommendationCode.count()
  if (existing > 0) {
    logger.info(`Recommendation codes table already has ${existing} rows, skipping seed`)
    return
  }

  const languageIdByGeneratedName = new Map<string, number>()
  for (const { generatedName, ...language } of RECOMMENDATION_LANGUAGE_SEEDS) {
    const created = await RecommendationLanguage.create(language as any)
    languageIdByGeneratedName.set(generatedName, created.get('id') as number)
  }

  const rows = generatedCodes().map(({ organisationCode, seed, courseCode }) => ({
    organisationCode,
    languageId: languageIdByGeneratedName.get(seed.generatedName),
    courseCode,
  }))

  await RecommendationCode.bulkCreate(rows as any, { ignoreDuplicates: true })
  logger.info(`Seeded ${RECOMMENDATION_LANGUAGE_SEEDS.length} recommendation languages and ${rows.length} codes`)
}
