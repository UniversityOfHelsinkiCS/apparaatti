//calculates distance between user and course coordinates, assumes 3 dimensions

import { Op, type DataTypes } from 'sequelize'
import type { CourseRecommendation } from '../../common/types.ts'
import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import { readCodeData, readCsvData } from './dataImport.ts'
import _ from 'lodash'
import { closestPeriod, dateObjToPeriod, dateToPeriod, getStudyPeriod, parseDate } from './studyPeriods.ts'
import StudyRight from '../db/models/studyRight.ts'
import User from '../db/models/user.ts'
import Answer from '../db/models/answer.ts'




function recommendCourses(answerData: any, user) {
  const userCoordinates = calculateUserCoordinates(answerData)
  
  const recommendations = getRecommendations(userCoordinates, answerData, user)
  
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


function getClosestPeriodFromUserPick(answerValue){
  switch (answerValue) {
  case '1':
    return closestPeriod('period_1').period
  case '2':
    return closestPeriod('period_2').period
  case '3':
   return closestPeriod('period_3').period
  case '4':
    return  closestPeriod('period_4').period
  default:
    return  closestPeriod().period
  }
}
function getPeriodDateFromUserPick(answerValue) {
  const period = getClosestPeriodFromUserPick(answerValue)
  return parseDate(period.start_date).getTime()
}




function calculateUserCoordinates(answerData: any) {
  const pickedPeriod = getStudyPeriod('2025', answerData['study-period'])
 
 
  const userCoordinates = {
  //  'period': convertUserPeriodPickToFloat(answerData['study-period']),
    'date': new Date(parseDate(pickedPeriod?.start_date)).getTime()
  }

  return userCoordinates
}

async function getCodesForCur(course: Cur){
  const curcus: CurCu[] = await CurCu.findAll({
    where: {curId: course.id},
  })

  const cuIds = curcus.map((curcu) => curcu.cuId)

  const cus: Cu[] = await Cu.findAll({
    where: {id: cuIds}
  })

  const codes = cus.map(cu => cu.courseCode)

  return codes
}


function langCoordFromCode (code: string){
  if(code.includes('KK-FI') || code.includes('KK-AIAK')){
    return '2'
  }
  if(code.includes('KK-RU')){
    return '3'
  }
  if(code.includes('KK-EN')){
    return '4'
  }

  return '1' //default = no choice
}
async function courseLangValue(course: Cur){
  const codesForCur = await getCodesForCur(course)

  const langValue = langCoordFromCode(codesForCur[0])
 
  return langValue
}

function convertUserPeriodPickToFloat(answerValue){
  console.log('answer value', answerValue)
  switch (answerValue) {
  case 'period_1':
    return 1.0
  case 'period_2':
    return 2.0
  case 'period_3':
    return 3.0
  case 'period_4':
    return 4.0  
  case 'intensive_3':
    return 5.0
  default:
    return 0.0
  }

}

async function calculateCourseDistance(course: Cur, userCoordinates: any){
  const period = coursePeriod(course)
  const dimensions = Object.keys(userCoordinates)
  // using random values for now...
  const courseCoordinates = {
    //'period': coursePeriodValue(period),
    'date': course.startDate.getTime()
  }
  

 
  const sum = dimensions.reduce((acc, key) => {
    const userValue = userCoordinates[key]
    const courseValue = courseCoordinates[key as keyof typeof dimensions]
    return acc + Math.pow(userValue - courseValue, 2)
  }, 0.0)


  const distance = Math.sqrt(sum)


  return {course: course, distance: distance }
}


function coursePeriod(course: Cur){
  const periods = dateObjToPeriod(course.startDate)
 
  if(periods.length == 0){
    console.log('!! no period found for course: ', course)
    return 0.0 // 0.0 is the value for courses that somehow didnt fit any period
  }


  const periodDistances =  periods.map((period) => {
    return {
      period: period,
      distance: course.startDate.getTime() - parseDate(period.start_date).getTime()
    }
  }).filter((p) => p.distance > 0)
    .sort((a, b) => a.distance - b.distance)
  
  //technically course can be in multiple periods but will use the first one returned for now...
  const period = periodDistances[0].period
  return period
}



//returns a list of [{course, distance}] 
async function calculateUserDistances(userCoordinates: any, availableCourses: Cur[]) {
  const distanceS = new Date()
  const distancePromises = availableCourses.map(course => {
    return calculateCourseDistance(course, userCoordinates)
  })
  const distances = await Promise.all(distancePromises)
  const distanceE = new Date()
  console.log('distance timer: ', distanceE - distanceS)

  return distances
}



async function getRealisationsWithCourseUnitCodes(courseCodeStrings: string[]) {
  const search = 'KK-'
  const courseUnitsWithCodes = await Cu.findAll({
    where: {
      courseCode: courseCodeStrings//{[Op.like]: `${search}%`},
    },
  })
  /*
  courseCodeStrings.map((code) => {
    if (!courseUnitsWithCodes.some(course => course.courseCode === code)) {
      console.log(`Course code ${code} not found in course data`)
    }
  })
    */

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
  const codeTimer = new Date()
  const recommendationsAsync: CourseRecommendation[] = courses.map(async (recommendation) => {
    const codes = await codesForCur(recommendation.course.id)
    return {
      course: recommendation.course,
      distance: recommendation.distance,
      courseCodes: codes //the codes could be saved in the previus steps?
    }
  })
  const recommendations = await Promise.all(recommendationsAsync)
  const codeTimerEnd = new Date()
  console.log("code timers: ",  codeTimerEnd - codeTimer)
  return recommendations
}



async function getRecommendations(userCoordinates: any, answerData, user) {  
  console.log(userCoordinates)
  const startBench = Date.now()
 
  const year = new Date().getFullYear()
  
  const pickedPeriod = getStudyPeriod('2025', answerData['study-period'])
  
  type courseCode = {
    code: string;
  }

  const courseTimer = Date.now()
  const courseCodes = await readCodeData() as courseCode[]
  const courseCodeStrings: string[] = courseCodes.map((course) => course.code)
  
  


  const filteredCourseCodeStrings = courseCodeStrings.filter((code) => langCoordFromCode(code) === answerData['lang-1'])

  const courseData = await getRealisationsWithCourseUnitCodes(filteredCourseCodeStrings)
  const courseEndTimer = Date.now()
  console.log(`Execution time for course end: ${courseEndTimer - courseTimer} ms`);


  
  const distances = await calculateUserDistances(userCoordinates, courseData)
  const recommendationsWithCodes = await addCourseCodesToRecommendations(distances)
  
  const start = parseDate(pickedPeriod.start_date)
  const sortedCourses = recommendationsWithCodes.filter((a) => a.course.startDate >= start ).sort((a, b) => a.distance - b.distance)
  const recommendations = sortedCourses.slice(0, 3)
  

  const end = Date.now()
  console.log(`Execution time: ${end - startBench} ms`);
  return recommendations
}

export default recommendCourses