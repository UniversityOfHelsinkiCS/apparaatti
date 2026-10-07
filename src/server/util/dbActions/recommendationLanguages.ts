import type { RecommendationLanguage as RecommendationLanguageType } from '../../../common/types.ts'
import RecommendationCode from '../../db/models/recommendationCode.ts'
import RecommendationLanguage from '../../db/models/recommendationLanguage.ts'

export async function allRecommendationLanguages(): Promise<RecommendationLanguageType[]> {
  const rows = await RecommendationLanguage.findAll({ order: [['id', 'ASC']] })
  return rows.map(row => row.toJSON() as RecommendationLanguageType)
}

export async function createRecommendationLanguage(data: object) {
  return await RecommendationLanguage.create(data as any)
}

export async function updateRecommendationLanguageById(id: number, data: object): Promise<number> {
  const [count] = await RecommendationLanguage.update(data as any, { where: { id } })
  return count
}

export async function deleteRecommendationLanguageById(id: number): Promise<number> {
  return await RecommendationLanguage.destroy({ where: { id } })
}

export async function countCodesForRecommendationLanguage(languageId: number): Promise<number> {
  return await RecommendationCode.count({ where: { languageId } })
}
