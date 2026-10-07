import type { RecommendationCode as RecommendationCodeType, RecommendationCodeRow } from '../../../common/types.ts'
import RecommendationCode from '../../db/models/recommendationCode.ts'
import RecommendationLanguage from '../../db/models/recommendationLanguage.ts'

export async function allRecommendationCodes(): Promise<RecommendationCodeType[]> {
  const rows = await RecommendationCode.findAll({
    include: [{ model: RecommendationLanguage, as: 'language' }],
    order: [
      ['organisationCode', 'ASC'],
      ['courseCode', 'ASC'],
    ],
  })
  return rows.map(row => row.toJSON() as RecommendationCodeType)
}

export async function allRecommendationCodeRows(): Promise<RecommendationCodeRow[]> {
  const codes = await allRecommendationCodes()
  return codes.map(code => ({
    organisationCode: code.organisationCode,
    lang: code.language!.lang,
    languageType: code.language!.languageType,
    primaryLanguageSpecification: code.language!.primaryLanguageSpecification,
    courseCode: code.courseCode,
  }))
}

export async function createRecommendationCode(data: object) {
  return await RecommendationCode.create(data as any)
}

export async function updateRecommendationCodeById(id: number, data: object): Promise<number> {
  const [count] = await RecommendationCode.update(data as any, { where: { id } })
  return count
}

export async function deleteRecommendationCodeById(id: number): Promise<number> {
  return await RecommendationCode.destroy({ where: { id } })
}
