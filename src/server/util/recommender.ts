//calculates distance between user and course coordinates, assumes 3 dimensions

import type { CourseRealization } from '../../common/types.ts'
import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import type { OrganisationRecommendation } from './organisationCourseRecommmendations.ts'
import { challegeCourseCodes, codesInOrganisations, courseHasAnyOfCodes, courseHasCustomCodeUrn, courseMatches, getUserOrganisationRecommendations, languageSpesificCodes, languageToStudy, mentoringCourseCodes, readOrganisationRecommendationData } from './organisationCourseRecommmendations.ts'
import { getStudyPeriod, parseDate } from './studyPeriods.ts'
import { getStudyData } from './studydata.ts'

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

function studyPlaceCoordinate(studyPlace: string){
  const baseCoordinate = Math.pow(10, 12)
  
  switch(studyPlace){
  case 'remote':
    return baseCoordinate * 1
  case 'hybrid':
    return baseCoordinate * 2
  case 'onsite':
    return baseCoordinate * 3
  default:
    return baseCoordinate * 2 // in between is a good default since it gives balanced results 
  
  }
}


function commonCoordinateFromAnswerData(value: string, yesValue: number, noValue: number, neutralValue: number){
  switch(value){
  case '1':
    return yesValue
  case '0':
    return noValue
  case 'neutral':
    return neutralValue
  }
}

function calculateUserCoordinates(answerData: any) {
  const periods = getRelevantPeriods(answerData['study-period'])
  // even tho the user might pickk multiple periods, we want to prioritize the first one since it is the closest period the user wants
  const pickedPeriod = periods[0] 

  const userCoordinates = {
    //  'period': convertUserPeriodPickToFloat(answerData['study-period']),
    date: new Date(parseDate(pickedPeriod.start_date)).getTime(),
    org: 0, // courses that have the same organisation will get the coordinate of 0 as well and the ones that are not get a big number, thus leading to better ordering of courses 
    lang: 0, // courses that have the same language as the user will get the coordinate of 0 as well and the ones that are not will get a big number
    graduation: commonCoordinateFromAnswerData(answerData['graduation'], Math.pow(10, 12), 0, null),
    mentoring: commonCoordinateFromAnswerData(answerData['mentoring'], Math.pow(10, 12), 0, null),
    integrated: commonCoordinateFromAnswerData(answerData['integrated'], Math.pow(10, 12), 0, null),
    studyPlace:  studyPlaceCoordinate(answerData['study-place']),
    replacement: commonCoordinateFromAnswerData(answerData['integrated'], Math.pow(10, 24), 0, null),
    challenge: commonCoordinateFromAnswerData(answerData['integrated'], Math.pow(10, 24), 0, null),
    independent: commonCoordinateFromAnswerData(answerData['integrated'], Math.pow(10, 24), 0, null),
    flexible: commonCoordinateFromAnswerData(answerData['integrated'], Math.pow(10, 24), 0, null),
  }
  return userCoordinates
}

function courseInSameOrganisationAsUser(course: any, codes: courseCodes){
  for(const courseCode of course.courseCodes){
    if (codes.userOrganisation.includes(courseCode)){
      return true
    }
  }
  return false
} 

function courseStudyPlaceCoordinate(course: CourseRealization){
  // console.log('calculating the study place value for, ', course.name.fi)


  const baseCoordinate = Math.pow(10, 12)
  const courseName = course.name.fi?.toLowerCase()
  // console.log(courseName)  
  // console.log(courseName?.includes('etäopetus') || courseName?.includes('verkko-opetus'))

  if(courseName?.includes('etäopetus' ) || courseName?.includes('verkko-opetus')){
    return baseCoordinate * 1  
  }
  if(courseName?.includes('monimuo')){
    return baseCoordinate * 2
  }
  if(courseName?.includes('lähiopetus')){
    return baseCoordinate * 3  
  }

  return baseCoordinate * 2 // course will be something in between remote and onsite and should be based in between as a default if nothing works
}



function isIndependentCourse(course: CourseRealization){
  const hasIndependentCodeUrn = courseHasCustomCodeUrn(course, 'kks-alm')
  const hasIndependentInName = course.name.fi?.toLowerCase().includes('itsenäinen')

  return hasIndependentCodeUrn || hasIndependentInName
}

async function calculateCourseDistance(course: CourseRealization, userCoordinates: any, studyData: any, codes: courseCodes,  courseLanguageType: string
) {
  
  const dimensions = Object.keys(userCoordinates)

  
  const sameOrganisationAsUser = courseInSameOrganisationAsUser(course, codes)
  const correctLang = courseHasAnyOfCodes(course, codes.languageSpesific)
  
  const hasGraduationCodeUrn = courseHasCustomCodeUrn(course, 'kks-val') || courseHasCustomCodeUrn(course, 'kkt-val') 
  const hasIntegratedCodeUrn = courseHasCustomCodeUrn(course, 'kks-int') 
  const hasReplacementCodeUrn = courseHasCustomCodeUrn(course, 'kks-kor')
  const hasFlexibleCodeUrn = courseHasCustomCodeUrn(course, 'kks-jou')
  
  const isIndependent = isIndependentCourse(course)
  const isMentoringCourse =  courseHasAnyOfCodes(course, mentoringCourseCodes)
  const isChallengeCourse = courseMatches(course, challegeCourseCodes, courseLanguageType) 
  const courseCoordinates = {
    date: course.startDate.getTime(),  
    org: sameOrganisationAsUser === true ? 0 : Math.pow(10, 12), // the user has coordinate of 0 in the org dimension, we want to prioritise courses that have the same organisation as the users...
    lang: correctLang === true ? 0 : Math.pow(10, 24), // if the course is different language than the users pick we want to have it very far away. 
    graduation: hasGraduationCodeUrn ? Math.pow(10, 12) : 0,
    mentoring: isMentoringCourse ? Math.pow(10, 12) : 0,
    integrated: hasIntegratedCodeUrn ? Math.pow(10, 12) : 0,
    studyPlace: courseStudyPlaceCoordinate(course),
    replacement:  hasReplacementCodeUrn ? Math.pow(10, 24) : 0,
    challenge: isChallengeCourse ? Math.pow(10, 24) : 0,
    independent: isIndependent ? Math.pow(10, 24) : 0,
    flexible: hasFlexibleCodeUrn ? Math.pow(10, 24) : 0
  }
  
  

  const sum = dimensions.reduce((acc, key) => {
    const userValue = userCoordinates[key]
    
    //If the user value is null it means that that dimension is to be ignored in the recommendation,
    //because the user has not chosen to use that dimension as a recommendation paramenter.
    if(!userValue){
      return acc
    }
    const courseValue = courseCoordinates[key as keyof typeof dimensions]
    return acc + Math.pow(userValue - courseValue, 2)
  }, 0.0)

  const distance = Math.sqrt(sum)

  return { course: course, distance: distance, coordinates: courseCoordinates }
}

//returns a list of [{course, distance}]
async function calculateUserDistances(
  userCoordinates: any,
  availableCourses: any,
  studyData: any,
  courseCodes: any,
  courseLanguageType: string
) {
  const distanceS = new Date()
  const distancePromises = availableCourses.map((course) => {
    return calculateCourseDistance(course, userCoordinates, studyData, courseCodes, courseLanguageType)
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
  const realisationTimer = Date.now()
  const courseUnitsWithCodes = await Cu.findAll({
    where: {
      courseCode: courseCodeStrings,
    },
  })
 
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


  const codesAndGroupsTimer = Date.now()
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
  const codesAndGroupsTimerE = Date.now()
  console.log('codes and groups timer: ', realisationTimerE - realisationTimer)
  

  const realisationTimerE = Date.now()
  console.log('realisation timer: ', codesAndGroupsTimerE - codesAndGroupsTimer)
  
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

/**
 * 
 * @param langCode 
 * Language that the user wants a course about
 * 
 * @param primaryLanguage 
 * Language that is the users primary language in school
 * 
 * @returns 
 * object that contains lists of course codes:
 * 
 * all: all possible course codes that could be recommended
 * 
 * userOrganisation: course codes that are in the same organisation as the user
 * 
 * languageSpesific: course codes that are in the same organisation AND are correct given the language choices of the user
 */
type courseCodes = {
  all: string[],
  userOrganisation: string[],
  languageSpesific: string[]
}

function getCourseCodes(langCode: string, primaryLanguage: string, organisationRecommendations: OrganisationRecommendation[], studyData: any): courseCodes{
  const codeTimer = Date.now()
  const allCodes = codesInOrganisations(organisationRecommendations)
  const userOrganisations = getUserOrganisationRecommendations(studyData, organisationRecommendations)
  const organisationCodes = codesInOrganisations(userOrganisations)
  const languageSpesific = languageSpesificCodes(userOrganisations, langCode, primaryLanguage)  

  const codeTimerE = Date.now()
  console.log('code time: ', codeTimerE - codeTimer)
  return {
    all: allCodes, 
    userOrganisation: organisationCodes, 
    languageSpesific: languageSpesific, 
  }
}

async function getRecommendations(userCoordinates: any, answerData, user: any) {
  const startBench = Date.now()
  const organisationRecommendations = readOrganisationRecommendationData()
  const studyData = await getStudyData(user) //used to filter courses by organisation
  const courseLanguageType = languageToStudy(answerData['lang-1'], answerData['primary-language'])


  const courseTimer = Date.now()
  const courseCodes = getCourseCodes(answerData['lang-1'], answerData['primary-language'],  organisationRecommendations, studyData)

  const courseData = await getRealisationsWithCourseUnitCodes(courseCodes.languageSpesific) // currently we want to use all course codes and the recommender uses distances to prioritise between different selections 
  
  const courseEndTimer = Date.now()
  console.log(`Execution time for course end: ${courseEndTimer - courseTimer} ms`)

  const distances = await calculateUserDistances(userCoordinates, courseData, studyData, courseCodes, courseLanguageType )
  

  const pickedPeriods = getRelevantPeriods(answerData['study-period'])
  const sortedCourses = distances.filter((course) => correctCoursePeriod(course, pickedPeriods)).sort((a, b) => a.distance - b.distance)
  const recommendations = sortedCourses

  const end = Date.now()
  console.log(`Execution time: ${end - startBench} ms`)
  return recommendations
}

export default recommendCourses
