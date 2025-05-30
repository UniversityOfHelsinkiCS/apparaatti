//calculates distance between user and course coordinates, assumes 3 dimensions

import type { DataTypes } from 'sequelize'
import type { CourseRecommendation } from '../../common/types.ts'
import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import { readCodeData, readCsvData } from './dataImport.ts'
import _ from 'lodash'

function recommendCourses(answerData: any) {
  const userCoordinates = calculateUserCoordinates(answerData)
  const recommendations = getRecommendations(userCoordinates)
  return recommendations
}

function convertAnswerValueToFloat(answerValue: any) {
  switch (answerValue) {
  case '1':
    return 0.0
  case '2':
    return 0.5
  case '3':
    return 1.0
  default:
    return 0.0
  }
}

function calculateUserCoordinates(answerData: any) {
  const userCoordinates = {
    fear: convertAnswerValueToFloat(answerData['1']),
    teachingMethod: convertAnswerValueToFloat(answerData['2']),
    experience: convertAnswerValueToFloat(answerData['3']),
  }
  return userCoordinates
}

//returns a list of [{course, distance}] 
function calculateUserDistances(userCoordinates: any, availableCourses: Cur[]) {
  const dimensions = Object.keys(userCoordinates)

  const distances = availableCourses.map(course => {
    // using random values for now...
    const courseCoordinates = {
      'fear': Math.random(),
      'teachingMethod': Math.random(), 
      'experience': Math.random(), 
    }
  
    const sum = dimensions.reduce((acc, key) => {
      const userValue = userCoordinates[key]
      const courseValue = courseCoordinates[key as keyof typeof dimensions]
      return acc + Math.pow(userValue - courseValue, 2)
    }, 0.0)

    const distance = Math.sqrt(sum)

    return {course: course, distance: distance }
  })

  return distances
}


async function getRealisationsWithCourseUnitCodesNew(courseCodeStrings: string[]){
  const realisations = await Cur.findAll({
    include: {
      model: Cu,
      where: {courseCode: courseCodeStrings},
      required: true
    }
  })

  const debug = await Cur.findAll({
    include: {
      model: Cu
    }
  })
  console.log(debug)

  return realisations
}

async function getRealisationsWithCourseUnitCodes(courseCodeStrings: string[]) {
  const courseUnitsWithCodes = await Cu.findAll({
    where: {
      courseCode: courseCodeStrings,
    },
  })

  courseCodeStrings.map((code) => {
    if (!courseUnitsWithCodes.some(course => course.courseCode === code)) {
      console.log(`Course code ${code} not found in course data`)
    }
  })

  //probably should be a join, but ill roll with this one
  const courseUnitIds = courseUnitsWithCodes.map(course => course.id)
  const courseRealizationIdsWithCourseUnit = await CurCu.findAll({
    where: {
      cuId: courseUnitIds,
    }
  })
  
  const wantedIds = courseRealizationIdsWithCourseUnit.map(curCu => curCu.curId)
  const courseRealizationsWithCourseUnit = await Cur.findAll({
    where: {
      id: wantedIds,
    },
  })

  return courseRealizationsWithCourseUnit
}

async function codesForCur(curId: string) {
  const curCuRelations = await CurCu.findAll({
    where: {
      curId: curId,
    },
  })

  const cuIds = curCuRelations.map(relation => relation.cuId)
  const courseUnits = await Cu.findAll({
    where: {
      id: cuIds,
    },
  })

  return courseUnits.map(courseUnit => courseUnit.courseCode)

}


async function addCourseCodesToRecommendations(courses) {
  const recommendationsAsync: CourseRecommendation[] = courses.map(async (recommendation) => {
    const codes = await codesForCur(recommendation.course.id)
    return {
      course: recommendation.course,
      distance: recommendation.distance,
      courseCodes: codes //the codes could be saved in the previus steps?
    }
  })
  const recommendations = await Promise.all(recommendationsAsync)
  
  return recommendations
}

async function getRecommendations(userCoordinates: any) {
  
  
  type courseCode = {
    code: string;
  }
  const courseCodes = await readCodeData() as courseCode[]
  const courseCodeStrings: string[] = courseCodes.map((course) => course.code)
  console.log(courseCodeStrings)
  const courseData = await getRealisationsWithCourseUnitCodesNew(courseCodeStrings)
  console.log(courseData)

  const distances = calculateUserDistances(userCoordinates, courseData)
  const sortedCourses = distances.sort((a, b) => a.distance - b.distance)
  const recommendations = sortedCourses.slice(0, 3)
  console.log('Recommendations:', recommendations)
  const recommendationsWithCodes  = await addCourseCodesToRecommendations(recommendations)
  console.log('Recommendations with codes:', recommendationsWithCodes)
  return recommendationsWithCodes
}

export default recommendCourses