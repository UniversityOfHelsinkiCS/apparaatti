
import type {
  ActivityPeriod,
  SisuCourseUnit,
  SisuCourseWithRealization,
} from './types.ts'
import { mangleData } from './mangleData.ts'

import { safeBulkCreate } from './util.ts'
import Cur from '../db/models/cur.ts'
import type { CourseRealization } from '../../common/types.ts'
// Find the newest course unit that has started before the course realisation
const getCourseUnit = (
  courseUnits: SisuCourseUnit[],
  activityPeriod: ActivityPeriod
) => {
  let courseUnit = courseUnits[0] // old default

  const { startDate: realisationStartDate } = activityPeriod

  courseUnits.sort((a, b) => {
    const { startDate: aStartDate } = a.validityPeriod
    const { startDate: bStartDate } = b.validityPeriod

    if (!aStartDate || !bStartDate) return 0

    return Date.parse(aStartDate) - Date.parse(bStartDate)
  })

  courseUnit =
    courseUnits.find(({ validityPeriod }) => {
      const { startDate } = validityPeriod

      if (!startDate) return false

      return Date.parse(realisationStartDate) > Date.parse(startDate)
    }) ?? courseUnit

  return courseUnit
}

const courseUnitsOf = ({ courseUnits }: any) => {
  const relevantFields = courseUnits.map((unit) => ({
    code: unit.code,
    organisations: unit.organisations,
  }))

  // take only unique values
  return relevantFields.reduce((acc, curr) => {
    const found = acc.find((item) => item.code === curr.code)
    if (!found) {
      acc.push(curr)
    }
    return acc
  }, [])
}

const createCursFromUpdater = async (realisations: SisuCourseWithRealization[]) => {
  const curs: CourseRealization[] = realisations.map((realisation) => {
    const { id, name, activityPeriod } = realisation
    const startDate = new Date(activityPeriod.startDate)
    const endDate = new Date(activityPeriod.endDate)
    return {
      id,
      name,
      startDate,
      endDate,
    }
  })

  console.log('curs to be created:')
  console.log(curs)

  Cur.bulkCreate(curs)

}

const coursesHandler = async (
  courseRealizations: SisuCourseWithRealization[]
) => {
  const filteredCourseRealizations = courseRealizations.filter(
    (course) =>
      course.courseUnits.length &&
      course.flowState !== 'CANCELLED' &&
      course.flowState !== 'ARCHIVED'
  )
  console.log("coursesHandler got courses: ")
  console.log(filteredCourseRealizations)  

  await createCursFromUpdater(filteredCourseRealizations)
  



}

// default 1000, set to 10 for example when debugging
const SPEED = 1000

export const fetchCoursesAndResponsibilities = async () => {
  await mangleData('courses', SPEED, coursesHandler)
}
