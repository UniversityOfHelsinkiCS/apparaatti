//calculates distance between user and course coordinates, assumes 3 dimensions

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

    return { ...course, distance }
  })

  return distances
}


async function getRealisationsWithCourseUnitCodes(courseCodeStrings: string[]) {
  const courseUnitsWithCodes = await Cu.findAll({
    where: {
      courseCode: courseCodeStrings,
    },
  })
  console.log('Found course units with codes:', courseUnitsWithCodes.length)
  console.log(courseUnitsWithCodes)

  courseCodeStrings.map((code) => {
    if (!courseUnitsWithCodes.some(course => course.courseCode === code)) {
      console.log(`Course code ${code} not found in course data`)
    }
  })

  //probably should be a join, but ill roll with this one
  const courseUnitIds = courseUnitsWithCodes.map(course => course.id)
  console.log('Course unit IDs:', courseUnitIds)
  const courseRealizationIdsWithCourseUnit = await CurCu.findAll({
    where: {
      cuId: courseUnitIds,
    }
  })
  console.log('Found course realizations with course unit:', courseRealizationIdsWithCourseUnit.length)
  console.log('Course realization IDs with course unit:', courseRealizationIdsWithCourseUnit)

  const wantedIds = courseRealizationIdsWithCourseUnit.map(curCu => curCu.curId)
  console.log('Wanted course realization IDs:', wantedIds)
  const courseRealizationsWithCourseUnit = await Cur.findAll({
    where: {
      id: wantedIds,
    },
  })
  console.log('Found course realizations with course unit:', courseRealizationsWithCourseUnit.length)
  const courseRealizations = courseRealizationsWithCourseUnit.map((realization) => {
    console.log('Realization:', realization.name)
  })

  return courseRealizationsWithCourseUnit
}


async function getRecommendations(userCoordinates: any) {
  
  
  type courseCode = {
    code: string;
  }
  const courseCodes = await readCodeData() as courseCode[]
  const courseCodeStrings: string[] = courseCodes.map((course) => course.code)
  console.log('Course codes:', courseCodes)

  const courseData = await getRealisationsWithCourseUnitCodes(courseCodeStrings)
  console.log('Wanted course realizations:', courseData)


  const distances = calculateUserDistances(userCoordinates, courseData)
  const sortedCourses = distances.sort((a, b) => a.distance - b.distance)
  const recommendations = sortedCourses.slice(0, 3)

  return recommendations
}

export default recommendCourses