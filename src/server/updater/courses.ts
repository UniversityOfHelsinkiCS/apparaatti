import type { SisuCourseWithRealization } from './types.ts'
import { mangleData } from './mangleData.ts'

import Cur from '../db/models/cur.ts'
import type { CourseRealization, CurCuRelation } from '../../common/types.ts'
import Cu from '../db/models/cu.ts'
import CurCu from '../db/models/curCu.ts'
import { Op } from 'sequelize'
// Find the newest course unit that has started before the course realisation

const createCursFromUpdater = async (
  realisations: SisuCourseWithRealization[]
) => {
  const curs: CourseRealization[] = realisations.map((realisation) => {
    const { id, name, activityPeriod, customCodeUrns, courseUnitRealisationTypeUrn } = realisation
    const startDate = new Date(activityPeriod.startDate)
    const endDate = new Date(activityPeriod.endDate)
    return {
      id,
      name,
      customCodeUrns, 
      courseUnitRealisationTypeUrn,
      startDate,
      endDate,
    }
  })

  try {
    //Cur.bulkCreate(curs, { ignoreDuplicates: true })
    for (const cur of curs){
      Cur.upsert(cur)
    }

    console.log('Curs created successfully')
  } catch (error) {
    console.error('Error creating curs:', error)
  }
}

const createCusFromUpdater = async (
  realisations: SisuCourseWithRealization[]
) => {
  const cus = realisations
    .map((realisation) => {
      const { courseUnits } = realisation
      return courseUnits
    })
    .flat()
    .map((courseUnit: any) => {
      return {
        id: courseUnit.id,
        credits: courseUnit.credits,
        name: courseUnit.name,
        courseCode: courseUnit.code,
        groupId: courseUnit.organisations[0]?.id ?? null,
      }
    })

  try {
    //Cu.bulkCreate(cus, { ignoreDuplicates: true })
    for (const cur of cus){
      Cu.upsert(cur)
    }
    console.log('Cus created successfully')
  } catch (error) {
    console.error('Error creating cus:', error)
  }
}

const createCurCusFromUpdater = async (
  realisations: SisuCourseWithRealization[]
) => {
  const CourseUnitIdsOfRealization = realisations.map((realisation) => {
    const { id } = realisation
    const courseUnitIds = realisation.courseUnits.map((unit) => unit.id)

    return {
      curId: id,
      cuIds: courseUnitIds,
    }
  })

  const curCuRelations: CurCuRelation[] = []
  CourseUnitIdsOfRealization.forEach((relation) => {
    const { curId, cuIds } = relation
    cuIds.forEach((cuId) => {
      curCuRelations.push({
        cuId,
        curId,
      })
    })
  })

  try {
    //delete old relations
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    await CurCu.destroy({
      where: {
        createdAt: {[Op.lt]: today,},
      },
    }
    )
    CurCu.bulkCreate(curCuRelations, { ignoreDuplicates: true })
    console.log('kurkut created successfully')
  } catch (error) {
    console.error('Error creating kurkkuja:', error)
  }
}

const coursesHandler = async (courseRealizations: any[]) => {
  const filteredCourseRealizations = courseRealizations.filter(
    (course) =>
      course.courseUnits.length &&
      course.flowState !== 'CANCELLED' &&
      course.flowState !== 'ARCHIVED'
  )

  console.log(
    `Found ${filteredCourseRealizations.length} valid course realizations`
  )
  // console.log(filteredCourseRealizations)
  await createCursFromUpdater(filteredCourseRealizations)
  await createCusFromUpdater(filteredCourseRealizations)
  await createCurCusFromUpdater(filteredCourseRealizations)
}

// default 1000, set to 10 for example when debugging
const SPEED = 1000

export const fetchCoursesAndResponsibilities = async () => {
  await mangleData('courses', SPEED, coursesHandler, new Date(2023, 0, 1))
}
