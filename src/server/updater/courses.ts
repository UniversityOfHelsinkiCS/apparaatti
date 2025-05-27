
import type {
  ActivityPeriod,
  SisuCourseUnit,
  SisuCourseWithRealization,
} from './types.ts'
import { mangleData } from './mangleData.ts'

import { safeBulkCreate } from './util.ts'
import Cur from '../db/models/cur.ts'
import type { CourseRealization, CurCuRelation } from '../../common/types.ts'
import Cu from '../db/models/cu.ts'
import CurCu from '../db/models/curCu.ts'
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

 

  try{
    Cur.bulkCreate(curs, {ignoreDuplicates: true})
    console.log('Curs created successfully')
  }
  catch (error) {
    console.error('Error creating curs:', error)
  }
}

const createCusFromUpdater = async (realisations: SisuCourseWithRealization[]) => {
  const cus = realisations.map((realisation) => {
    const { id, name, courseUnits, activityPeriod } = realisation
    const courseUnit = getCourseUnit(courseUnits, activityPeriod)

    return {
      id: courseUnit.id,
      name: courseUnit.name,
      courseCode: courseUnit.code,
      groupId: courseUnit.organisations[0]?.id ?? null,
    }
  })

  try{
    Cu.bulkCreate(cus, {ignoreDuplicates: true})
    console.log('Cus created successfully')
  }
  catch (error) {
    console.error('Error creating cus:', error)
  }



}


const createCurCusFromUpdater = async (realisations: SisuCourseWithRealization[]) => {
  const CourseUnitIdsOfRealization = realisations.map((realisation) => {
    const { id, courseUnits } = realisation
    const courseUnitIds = realisation.courseUnits.map((unit) => unit.id)

    return({
      curId: id,
      cuIds: courseUnitIds,
    })


  })
  
  let curCuRelations: CurCuRelation[] = []
  CourseUnitIdsOfRealization.forEach((relation) => {
    const { curId, cuIds } = relation
    cuIds.forEach((cuId) => {
      curCuRelations.push({
        cuId,
        curId,
      })
    })
  })

  try{
    CurCu.bulkCreate(curCuRelations, {ignoreDuplicates: true})
    console.log('kurkut created successfully')
  }
  catch (error) {
    console.error('Error creating kurkkuja:', error)
  }
  
}





const coursesHandler = async (
  courseRealizations: any[]
) => {
 // console.log(courseRealizations)
 courseRealizations.forEach((course) => {
  console.log(course)
  console.log(course.assesmentItemIds)
  console.log("-----")
}) 
// console.log(courseRealizations[0].assesmentItemIds)
  const filteredCourseRealizations = courseRealizations.filter(
    (course) =>
      course.courseUnits.length &&
      course.flowState !== 'CANCELLED' &&
      course.flowState !== 'ARCHIVED'
  )


  await createCursFromUpdater(filteredCourseRealizations)
  await createCusFromUpdater(filteredCourseRealizations)
  await createCurCusFromUpdater(filteredCourseRealizations)


}

// default 1000, set to 10 for example when debugging
const SPEED = 1000

export const fetchCoursesAndResponsibilities = async () => {
  await mangleData('courses', SPEED, coursesHandler)
}
