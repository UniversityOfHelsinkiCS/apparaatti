import CourseAdminReview from '../../db/models/CourseAdminReview.ts'

export async function createOrUpdateCourseAdminReviewEntry(curId: string, reviewed: string, comment?: string) {
  const existingReview = await CourseAdminReview.findOne({
    where: { curId },
    order: [['updatedAt', 'DESC']],
  })

  if (existingReview) {
    existingReview.reviewed = reviewed
    existingReview.comment = comment ?? ''
    await existingReview.save()
    return existingReview.get({ plain: true })
  }

  const createdReview = await CourseAdminReview.create({
    curId,
    reviewed,
    comment: comment ?? '',
  })

  return createdReview.get({ plain: true })
}

export async function getCourseAdminReviewByCurId(curId: string) {
  return await CourseAdminReview.findOne({
    where: { curId },
    order: [['updatedAt', 'DESC']],
    raw: true,
  })
}

export async function reviewsForCurIds(curIds: string[]) {
  return await CourseAdminReview.findAll({
    where: { curId: curIds },
    order: [['updatedAt', 'ASC']],
    raw: true,
  })
}
