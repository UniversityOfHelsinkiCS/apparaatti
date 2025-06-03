//calculates distance between user and course coordinates, assumes 3 dimensions

import type { DataTypes } from 'sequelize'
import type { CourseRecommendation } from '../../common/types.ts'
import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import { readCodeData, readCsvData } from './dataImport.ts'
import _ from 'lodash'
import { dateObjToPeriod, dateToPeriod } from './studyPeriods.ts'

function recommendCourses(answerData: any) {
  const userCoordinates = calculateUserCoordinates(answerData)
  console.log('after user coordinates')
  const recommendations = getRecommendations(userCoordinates, answerData)
  console.log('after recommendations')
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

function convertNoOptionChoiceToFloat(answerValue){
  switch (answerValue) {
  case '1':
    return 0.0
  case '2':
    return 1.0
  case '3':
    return 2.0
  case '4':
    return 3.0  
  default:
    return 0.0
  }
  
}


function calculateUserCoordinates(answerData: any) {
  const userCoordinates = {
    'period': convertUserPeriodPickToFloat(answerData['1']),
    'course_lang': convertNoOptionChoiceToFloat(answerData['lang-1'])
  }

  return userCoordinates
}

async function getCodesForCur(course: Cur){
  const curcus: CurCu[] = await CurCu.findAll({
    where: {curId: course.id},
    include: Cu
  })
  console.log(curcus)
  
  return curcus
}

async function courseLangValue(course: Cur){
  const codesForCur = await getCodesForCur(course)
  return 1.0
}

function convertUserPeriodPickToFloat(answerValue){
  switch (answerValue) {
  case '1':
    return 1.0
  case '2':
    return 2.0
  case '3':
    return 3.0
  case '4':
    return 4.0  
  default:
    return 0.0
  }

}

function coursePeriodValue(course: Cur){
  console.log('calculating course period value')
  //technically course can be in multiple periods but will use the first one returned for now...
  console.log('before date to period')

  
  const periods = dateObjToPeriod(course.startDate)
  console.log(periods)
  if(periods.length == 0){
    console.log('!! no period found for course: ', course)
    return 0.0 // 0.0 is the value for courses that somehow didnt fit any period
  }
  console.log('after date to period')
  const period = periods[0]
  console.log(period)
  


  switch (period.name) {
  case 'period_1':
    return 1.0
  case 'period_2':
    return 2.0
  case 'period_3':
    return 3.0
  case 'period_4':
    return 4.0
  default: //the intensives and exam weeks are considered a value of 0 for now...
    return 0.0
  }
  

}

//returns a list of [{course, distance}] 
function calculateUserDistances(userCoordinates: any, availableCourses: Cur[]) {
  console.log('calculating user distances')
  const dimensions = Object.keys(userCoordinates)

  const distances = availableCourses.map(course => {
    // using random values for now...
    const courseCoordinates = {
      'period': coursePeriodValue(course),
      'course_lang': courseLangValue(course)
    }
    console.log('calculated course period value')

    console.log(courseCoordinates)
    const sum = dimensions.reduce((acc, key) => {
      const userValue = userCoordinates[key]
      const courseValue = courseCoordinates[key as keyof typeof dimensions]
      return acc + Math.pow(userValue - courseValue, 2)
    }, 0.0)
    console.log(sum)

    const distance = Math.sqrt(sum)
    console.log(distance)

    return {course: course, distance: distance }
    
  })
  console.log('distances calculated')
  return distances
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



async function getRecommendations(userCoordinates: any, answerData) {
  
  
  type courseCode = {
    code: string;
  }
  const courseCodes = await readCodeData() as courseCode[]
  const courseCodeStrings: string[] = courseCodes.map((course) => course.code)
  console.log(courseCodeStrings)
  const courseData = await getRealisationsWithCourseUnitCodes(courseCodeStrings)
  console.log(courseData)
  console.log('after getting realistations with course codes')

  const distances = calculateUserDistances(userCoordinates, courseData)
  const sortedCourses = distances.sort((a, b) => a.distance - b.distance)
  const recommendations = sortedCourses.slice(0, 3)
  console.log('Recommendations:', recommendations)
  const recommendationsWithCodes  = await addCourseCodesToRecommendations(recommendations)
  console.log('Recommendations with codes:', recommendationsWithCodes)
  return recommendationsWithCodes
}

export default recommendCourses