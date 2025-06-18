import _ from 'lodash'

import { mangleData } from './mangleData.ts'



export const fetchEnrolments = async () => {
  const getDataSince = new Date()
  getDataSince.setFullYear(getDataSince.getFullYear() - 1)

  await mangleData('enrolments-new', 1_000, enrolmentsHandler, getDataSince)
}
