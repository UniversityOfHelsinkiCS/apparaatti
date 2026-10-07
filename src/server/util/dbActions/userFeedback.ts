import { Op } from 'sequelize'

import type { RecommendationMetadata, UserFeedback as UserFeedbackType } from '../../../common/types.ts'
import UserFeedback from '../../db/models/userFeedback.ts'

export async function createUserFeedbackEntry(
  textFeedback: string,
  stars: number,
  date: Date,
  recommendationMetadata?: RecommendationMetadata,
  appVersion?: string,
  email?: string
) {
  await UserFeedback.create({
    textFeedback,
    stars,
    recommendationMetadata: recommendationMetadata ?? null,
    appVersion: appVersion ?? null,
    email: email ?? null,
    date,
  })
}

export async function getUserFeedbackEntries(start: Date, end: Date): Promise<UserFeedbackType[]> {
  return (await UserFeedback.findAll({
    where: {
      date: {
        [Op.gte]: start,
        [Op.lte]: end,
      },
    },
    order: [['date', 'DESC']],
    raw: true,
  })) as UserFeedbackType[]
}

export async function deleteUserFeedbackByIds(ids: number[]): Promise<number> {
  return await UserFeedback.destroy({ where: { id: { [Op.in]: ids } } })
}

export async function deleteUserFeedbackOlderThan(before: Date): Promise<number> {
  return await UserFeedback.destroy({ where: { date: { [Op.lt]: before } } })
}
