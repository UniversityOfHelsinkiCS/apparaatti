//calculates distance between user and course coordinates, assumes 3 dimensions

import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import { readCodeData } from './dataImport.ts'
import { getStudyPeriod, parseDate } from './studyPeriods.ts'
import { getStudyData } from './studydata.ts'
import { readOrganisationRecommendationData } from './organisationCourseRecommmendations.ts'




const getStudyYearFromPeriod = (id: string) => {
  const d = new Date()
  //const d = new Date("December 21, 2025 01:15:00")
  const y = d.getFullYear()
  const m = d.getMonth() + 1

  if (m < 9) {
    //kevät (jan-aug)  //voi alka jo elokuun lopulla
    if (id === 'intensive_3_previous') {
      return String(y - 1)
    } else {
      return String(y)
    }
  } else if (m > 8 && m < 13) {
    //syksy (sep-dec)
    if (id === 'intensive_3_previous') {
      return String(y)
    } else {
      return String(y + 1)
    }
  }
  return ''
}

function recommendCourses(answerData: any, user) {
  const userCoordinates = calculateUserCoordinates(answerData)

  const recommendations = getRecommendations(userCoordinates, answerData, user)

  return recommendations
}

function calculateUserCoordinates(answerData: any) {
  const periods = getRelevantPeriods(answerData['study-period'])
  // even tho the user might pickk multiple periods, we want to prioritize the first one since it is the closest period the user wants
  const pickedPeriod = periods[0] 

  const userCoordinates = {
    //  'period': convertUserPeriodPickToFloat(answerData['study-period']),
    date: new Date(parseDate(pickedPeriod.start_date)).getTime(),
    org: 0 // courses that have the same organisation will get the coordinate of 0 as well and the ones that are not get a big number, thus leading to better ordering of courses 
  }

  return userCoordinates
}

function langCoordFromCode(code: string) {
  if (code.includes('KK-FI') || code.includes('KK-AIAK')) {
    return '2'
  }
  if (code.includes('KK-RU')) {
    return '3'
  }
  if (code.includes('KK-EN')) {
    return '4'
  }

  return '1' //default = no choice
}

async function calculateCourseDistance(course: Cur, userCoordinates: any, studyData: any) {
  
  const dimensions = Object.keys(userCoordinates)

  
  const sameOrganisationAsUser = courseInSameOrgAsUser(course, studyData)
  const courseCoordinates = {
    //'period': coursePeriodValue(period),
    date: course.startDate.getTime(),  
    org: sameOrganisationAsUser === true ? 0 : Math.pow(10, 12) // the user has coordinate of 0 in the org dimension, we want to prioritise courses that have the same organisation as the users...
  }
  
  

  const sum = dimensions.reduce((acc, key) => {
    const userValue = userCoordinates[key]
    const courseValue = courseCoordinates[key as keyof typeof dimensions]
    return acc + Math.pow(userValue - courseValue, 2)
  }, 0.0)

  const distance = Math.sqrt(sum)

  return { course: course, distance: distance }
}

//returns a list of [{course, distance}]
async function calculateUserDistances(
  userCoordinates: any,
  availableCourses: any,
  studyData: any
) {
  const distanceS = new Date()
  const distancePromises = availableCourses.map((course) => {
    return calculateCourseDistance(course, userCoordinates, studyData)
  })
  const distances = await Promise.all(distancePromises)
  const distanceE = new Date()
  console.log('distance timer: ', distanceE - distanceS)

  return distances
}

const uniqueVals = (arr: any[]) => {
  return [...new Set(arr)]
}

async function getRealisationsWithCourseUnitCodes(courseCodeStrings: string[]) {
  const courseUnitsWithCodes = await Cu.findAll({
    where: {
      courseCode: courseCodeStrings, //{[Op.like]: `${search}%`},
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
  const courseUnitIds = courseUnitsWithCodes.map((course) => course.id)
  const courseRealizationIdsWithCourseUnit = await CurCu.findAll({
    where: {
      cuId: courseUnitIds,
    },
    raw: true,
  })

  const wantedIds = courseRealizationIdsWithCourseUnit.map(
    (curCu) => curCu.curId
  )
  const courseRealizationsWithCourseUnit = await Cur.findAll({
    where: {
      id: wantedIds,
    },
    raw: true,
  })

  const courseRealisationsWithCourseUnits =
    courseRealizationsWithCourseUnit.map((cur) => {
      return {
        ...cur,
        unitIds: uniqueVals(courseRealizationIdsWithCourseUnit
          .filter((curcu) => curcu.curId === cur.id)
          .map((curcu) => curcu.cuId)),
      }
    })

  const courseRealisationsWithCodes = courseRealisationsWithCourseUnits.map(
    (cur) => {
      return {
        ...cur,
        courseCodes: uniqueVals(courseUnitsWithCodes
          .filter((cu) => cur.unitIds.includes(cu.id))
          .map((cu) => cu.courseCode)),
        groupIds: uniqueVals(courseUnitsWithCodes
          .filter((cu) => cur.unitIds.includes(cu.id))
          .map((cu) => cu.groupId)),
      }
    }
  )
  return courseRealisationsWithCodes
}


//Takes a list of period names or a single period name and returns a list of periods that are in the current study year of the user
//For example if it is autumn 2024 and the user picks sends: [period_1, period_4] -> [{period that starts in autumn in 2024}, {period that starts in spring in 2025}]
function getRelevantPeriods(periodsArg: string[] | string) {
  const periods = Array.isArray(periodsArg) ? periodsArg : [periodsArg]
   
  const pickedPeriods = periods.map((period: string) => {
    const year = getStudyYearFromPeriod(period)
    const pickedPeriod = getStudyPeriod(year, period)
    return pickedPeriod
  })

 
  return pickedPeriods
}

//Returns true if the course starts or ends within any of the picked periods
function correctCoursePeriod(course: any, pickedPeriods: any){
 
  const courseStart = new Date(course.course.startDate)
  const courseEnd = new Date(course.course.endDate)
  for (const period of pickedPeriods) {
    const periodStart = new Date(parseDate(period.start_date))
    const periodEnd = new Date(parseDate(period.end_date))

    if (courseStart >= periodStart && courseStart <= periodEnd) {
      return true
    }
   
    if (courseEnd >= periodStart && courseEnd <= periodEnd) {
      return true
    }
    
  }
  return false
  
} 
const data = readOrganisationRecommendationData()

//Checks if the course is in the same org as the user based on the provided data spreadsheet.
function courseInSameOrgAsUser(course: any, studyData: any){
  const userOrganisations = studyData.organisations
  
  const usersOrganisationCodes: string[] = userOrganisations.map((org: any) => org.code)
  
  const dataOrganisations = data.filter((org) => usersOrganisationCodes.includes(org.name))
  
  const allCourseCodesInOrganisation = dataOrganisations.map((org) => org.languages.map((lang) => lang.codes).flat()).flat()
  
  for(const code of course.courseCodes){
    if(allCourseCodesInOrganisation.includes(code)){
      return true
    }
  }
  return false
}



async function getRecommendations(userCoordinates: any, answerData, user: any) {
  const startBench = Date.now()
  const studyData = await getStudyData(user) //used to filter courses by organisation
  const pickedPeriods = getRelevantPeriods(answerData['study-period'])
  
  type courseCode = {
    code: string
  }

  const courseTimer = Date.now()
  const courseCodes = (await readCodeData()) as courseCode[]
  const courseCodeStrings: string[] = courseCodes.map((course) => course.code)

  const filteredCourseCodeStrings = courseCodeStrings.filter(
    (code) => langCoordFromCode(code) === answerData['lang-1']
  )

  const courseData = await getRealisationsWithCourseUnitCodes(
    filteredCourseCodeStrings
  )
  const courseEndTimer = Date.now()
  console.log(
    `Execution time for course end: ${courseEndTimer - courseTimer} ms`
  )

  const distances = await calculateUserDistances(userCoordinates, courseData, studyData)
  const sortedCourses = distances.filter((course) => correctCoursePeriod(course, pickedPeriods)).sort((a, b) => a.distance - b.distance)
  // console.log(sortedCourses)
  const recommendations = sortedCourses
  
  const end = Date.now()
  console.log(`Execution time: ${end - startBench} ms`)
  return recommendations
}

export default recommendCourses
