//calculates distance between user and course coordinates, assumes 3 dimensions

import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import { readCodeData, readCsvData } from './dataImport.ts'
import _ from 'lodash'
import { getStudyPeriod, parseDate } from './studyPeriods.ts'

function recommendCourses(answerData: any, user) {
  const userCoordinates = calculateUserCoordinates(answerData)
  
  const recommendations = getRecommendations(userCoordinates, answerData, user)
  
  return recommendations
}

function calculateUserCoordinates(answerData: any) {
  const pickedPeriod = getStudyPeriod('2025', answerData['study-period'])
 
 
  const userCoordinates = {
  //  'period': convertUserPeriodPickToFloat(answerData['study-period']),
    'date': new Date(parseDate(pickedPeriod?.start_date)).getTime()
  }

  return userCoordinates
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

async function calculateCourseDistance(course: Cur, userCoordinates: any){
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




//returns a list of [{course, distance}] 
async function calculateUserDistances(userCoordinates: any, availableCourses: any) {
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
    },
    raw: true
  })
  
  const wantedIds = courseRealizationIdsWithCourseUnit.map(curCu => curCu.curId)
  const courseRealizationsWithCourseUnit = await Cur.findAll({
    where: {
      id: wantedIds,
    },
    raw: true
  })

  const courseRealisationsWithCourseUnits = courseRealizationsWithCourseUnit.map((cur) => {
    return{
      ...cur,
      unitIds: courseRealizationIdsWithCourseUnit.filter((curcu) => curcu.curId === cur.id).map((curcu) => curcu.cuId)
    }
  })
 
  const courseRealisationsWithCodes = courseRealisationsWithCourseUnits.map((cur) => {
    return{
      ...cur,
      courseCodes: courseUnitsWithCodes.filter((cu) => cur.unitIds.includes(cu.id)).map((cu) => cu.courseCode)
    }
  })
  return courseRealisationsWithCodes
}


async function getRecommendations(userCoordinates: any, answerData, user) {  
  console.log(userCoordinates)
  const startBench = Date.now()
  
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
  console.log(`Execution time for course end: ${courseEndTimer - courseTimer} ms`)


  
  const distances = await calculateUserDistances(userCoordinates, courseData)
  //const recommendationsWithCodes = await addCourseCodesToRecommendations(distances)
  
  const start = parseDate(pickedPeriod.start_date)
  const sortedCourses = distances.filter((a) => a.course.startDate >= start ).sort((a, b) => a.distance - b.distance)
  const recommendations = sortedCourses.slice(0, 3)
  

  const end = Date.now()
  console.log(`Execution time: ${end - startBench} ms`)
  return recommendations
}

export default recommendCourses