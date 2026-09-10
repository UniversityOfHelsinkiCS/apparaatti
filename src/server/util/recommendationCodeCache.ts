import type { RecommendationCodeRow } from '../../common/types.ts'
import { allRecommendationCodeRows } from './dbActions.ts'
import logger from './logger.ts'

let cachedRows: RecommendationCodeRow[] | null = null

export async function loadRecommendationCodes(): Promise<void> {
  cachedRows = await allRecommendationCodeRows()
}

export function readRecommendationCodes(): RecommendationCodeRow[] {
  if (cachedRows === null) {
    logger.error('Recommendation codes cache was never loaded')
    return []
  }
  return cachedRows
}
