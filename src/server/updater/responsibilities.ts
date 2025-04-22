import _ from 'lodash'
import { Op } from 'sequelize'
import { sequelize } from '../db/connection'
import { ChatInstance, Responsibility } from '../db/models'
import { ResponsibilityRow, SisuCourseWithRealization } from '../types'
import { safeBulkCreate } from './util'

const removeOldResponsibilities = async (
  responsibilitiesToInsert: ResponsibilityRow[]
) => {
  const chatInstanceIds = responsibilitiesToInsert.map(
    ({ chatInstanceId }) => chatInstanceId
  )

  await Responsibility.destroy({
    where: {
      chatInstanceId: {
        [Op.in]: chatInstanceIds,
      },
    },
  })
}

const getResponsibilityInfos = (
  courseRealisation: SisuCourseWithRealization
) => {
  const combinedResponsibilityInfos = courseRealisation.responsibilityInfos

  const uniqueResponsibilityInfos = _.uniqBy(
    combinedResponsibilityInfos,
    ({ personId, roleUrn }) => `${personId}${roleUrn}`
  )

  return uniqueResponsibilityInfos
}
