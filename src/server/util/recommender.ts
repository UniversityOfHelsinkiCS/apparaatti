//calculates distance between user and course coordinates, assumes 3 dimensions

import { record } from 'zod'
import type { CourseData, CourseRecommendation, CourseRecommendations } from '../../common/types.ts'
import Cu from '../db/models/cu.ts'
import Cur from '../db/models/cur.ts'
import CurCu from '../db/models/curCu.ts'
import { uniqueVals } from './misc.ts'
import type { OrganisationRecommendation } from './organisationCourseRecommmendations.ts'
import { challegeCourseCodes, codesInOrganisations, courseHasAnyOfCodes, courseHasCustomCodeUrn, courseMatches, getUserOrganisationRecommendations, languageSpesificCodes, languageToStudy, mentoringCourseCodes, readOrganisationRecommendationData } from './organisationCourseRecommmendations.ts'
import { getStudyPeriod, parseDate } from './studyPeriods.ts'
import Organisation from '../db/models/organisation.ts'

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

function recommendCourses(answerData: any) {
  const userCoordinates = calculateUserCoordinates(answerData)

  const recommendations = getRecommendations(userCoordinates, answerData)

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
    replacement: commonCoordinateFromAnswerData(answerData['replacement'], Math.pow(10, 24), 0, null),
    challenge: commonCoordinateFromAnswerData(answerData['challenge'], Math.pow(10, 24), 0, null),
    independent: commonCoordinateFromAnswerData(answerData['independent'], Math.pow(10, 24), 0, null),
    flexible: commonCoordinateFromAnswerData(answerData['flexible'], Math.pow(10, 24), 0, null),
  }
  return userCoordinates
}

const organisationCodeToUrn: Record<string, string> = {
  'H50': 'kkt-mat',
  'H20': 'kkt-oik',
  'H10': 'kkt-teo',
  'H74': 'kkt-ssk',
  'H70': 'kkt-val', //kkt-val -> valtiotieteel. might be confused with kks-val -> valmistuville, graduation,
  'H90': 'kkt-ela',
  'H60': 'kkt-kas', //kasvatustieteel.
  'H57': 'kkt-bio',
  'H80': 'kkt-mm', //maa metsa
  '4141': 'kkt-sps', //soveltava spykologia
  'H305': 'kkt-ham',
  'H30': 'kkt-laa',
  'H3456': 'kkt-log', //logopedia seems to have multiple entries in organisations with the same name
  '414': 'kkt-psy',
  'H55': 'kkt-far'
 
}

async function courseInSameOrganisationAsUser(course: any, organisationCode: string){
  const codes = [organisationCode]
  // console.log(codes)
  for(const code of codes){
    const urnHit = organisationCodeToUrn[code]
    if(urnHit){
      return courseHasCustomCodeUrn(course, urnHit)
    }
  }
  const organisations  = await Organisation.findAll({
    where:{
      id: [course.groupIds]
    },
    raw: true,
  })

  const orgCodes = organisations.map(o => o.code)
  if( organisationCode in orgCodes){
    return true
  }
  return false
} 
function courseStudyPlaceCoordinate(course: CourseData){
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



function isIndependentCourse(course: CourseData){
  const hasIndependentCodeUrn = courseHasCustomCodeUrn(course, 'kks-alm')
  const hasIndependentInName = course.name.fi?.toLowerCase().includes('itsenäinen')

  return hasIndependentCodeUrn || hasIndependentInName
}
function courseOrganisationCoord(){
  
}
async function calculateCourseDistance(course: CourseData, userCoordinates: any, codes: courseCodes,  courseLanguageType: string, organisationCode:string
): CourseRecommendation {
  
  const dimensions = Object.keys(userCoordinates)

  
  const sameOrganisationAsUser = await courseInSameOrganisationAsUser(course, organisationCode)
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
    org: sameOrganisationAsUser === true ? 0 : 1, // there is a offset value for this field to make sure that different organisation leads to a really high distance

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
  
  const offsetValue = sameOrganisationAsUser === true ? 0 : Math.pow(10, 12)

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

  const distance = Math.sqrt(sum) + offsetValue

  return { course: course, distance: distance, coordinates: courseCoordinates }
}

//returns a list of [{course, distance}]
async function calculateUserDistances(
  userCoordinates: any,
  availableCourses: any,
  courseCodes: any,
  courseLanguageType: string,
  organisationCode:string
): CourseRecommendation[] {
  const distanceS = new Date()
  const distancePromises = availableCourses.map((course) => {
    return calculateCourseDistance(course, userCoordinates, courseCodes, courseLanguageType, organisationCode)
  })
  const distances = await Promise.all(distancePromises)
  const distanceE = new Date()
  console.log('distance timer: ', distanceE - distanceS)

  return distances
}



async function getRealisationsWithCourseUnitCodes(courseCodeStrings: string[]) {
  const realisationTimer = Date.now()

  const start = Date.now()
  const courseUnitsWithCodes = await Cu.findAll({
    where: {
      courseCode: courseCodeStrings,
    },
  })


  const curcuTimer = Date.now()
  const courseUnitIds = courseUnitsWithCodes.map((course) => course.id)
  const courseRealizationIdsWithCourseUnit = await CurCu.findAll({
    where: {
      cuId: courseUnitIds,
    },
    raw: true,
  })
  const curcuTimerE = Date.now()
  console.log('curcu timer: ', curcuTimerE - curcuTimer)

  const wantedIds = courseRealizationIdsWithCourseUnit.map(
    (curCu) => curCu.curId
  )
  const courseRealizations = await Cur.findAll({
    where: {
      id: wantedIds,
    },
    raw: true,
  })
  

  const end = Date.now()
  console.log('getting the data out of db: ', end - start)
 


  const courseRealisationsWithCourseUnits =
    courseRealizations.map((cur) => {
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
        credits: courseUnitsWithCodes
          .filter((cu)=> cur.unitIds.includes(cu.id))
          .map((cu) => cu.credits),
      }
    }
  )
  const codesAndGroupsTimerE = Date.now()
  console.log('codes and groups timer: ', codesAndGroupsTimerE - codesAndGroupsTimer)
  

  const realisationTimerE = Date.now()
  console.log('realisation timer: ', realisationTimerE - realisationTimer)
  
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

function getCourseCodes(langCode: string, primaryLanguage: string, organisationRecommendations: OrganisationRecommendation[], userOrganisationCode: string): courseCodes{
  const codeTimer = Date.now()
  const allCodes = codesInOrganisations(organisationRecommendations)
  console.log(userOrganisationCode)
  const userOrganisations = getUserOrganisationRecommendations(userOrganisationCode, organisationRecommendations)
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
//applies a set of filters until the list of relevant courses is of certain lenght
function relevantCourses(courses: CourseRecommendation[], userCoordinates: any){
  //the courses in relevant always must be within the same organisation
  // const recommendationsInOrganisation = courses.filter((c) => c.coordinates.org === 0).sort((a, b) => a.distance - b.distance)
  // console.log(recommendationsInOrganisation.length)
  // if(recommendationsInOrganisation.length < 5){
  //   return recommendationsInOrganisation
  // }
  const noExams = courses.filter(c => !c.course.name.fi?.toLowerCase().includes('tentti'))
 
  const comparisons = [
    (c: CourseRecommendation, userCoordinates) => {return c.coordinates.mentoring === userCoordinates.mentoring},
    (c: CourseRecommendation, userCoordinates) => {return c.coordinates.integration === userCoordinates.integration},
    (c: CourseRecommendation, userCoordinates) => {return c.coordinates.challenge === userCoordinates.challenge},
    (c: CourseRecommendation, userCoordinates) => { return c.coordinates.independent === userCoordinates.independent},
    (c: CourseRecommendation, userCoordinates) => {return c.coordinates.replacement === userCoordinates.replacement},
    (c: CourseRecommendation, userCoordinates) => {return c.coordinates.flexible === userCoordinates.flexible},
    (c: CourseRecommendation, userCoordinates) => {return c.coordinates.studyPlace === userCoordinates.studyPlace},
    (c: CourseRecommendation, userCoordinates) => {return c.coordinates.org === userCoordinates.org}
  ]
  let final = noExams
  for(const comp of comparisons){
    const newFilter = final.filter((c) => comp(c, userCoordinates) === true)
    console.log(newFilter.length)
    if( newFilter.length < final.length && newFilter.length > 0){

      console.log('found a better filtering!')
      final = [...newFilter]

    }
  }
  
  return final
  

}


async function getRecommendations(userCoordinates: any, answerData): CourseRecommendations {
  const startBench = Date.now()
  const organisationRecommendations = readOrganisationRecommendationData()
  //used to filter courses by organisation
  const organisationCode = answerData['study-field-select']

  const courseLanguageType = languageToStudy(answerData['lang-1'], answerData['primary-language'])


  const courseTimer = Date.now()
  console.log(organisationCode)
  const courseCodes = getCourseCodes(answerData['lang-1'], answerData['primary-language'],  organisationRecommendations, organisationCode)

  const courseData = await getRealisationsWithCourseUnitCodes(courseCodes.languageSpesific) // currently we want to use all course codes and the recommender uses distances to prioritise between different selections 
  
  const courseEndTimer = Date.now()
  console.log(`Execution time for course end: ${courseEndTimer - courseTimer} ms`)

  const distances = await calculateUserDistances(userCoordinates, courseData, courseCodes, courseLanguageType, organisationCode )
  

  const pickedPeriods = getRelevantPeriods(answerData['study-period'])
  const sortedCourses = distances.filter((course) => correctCoursePeriod(course, pickedPeriods)).sort((a, b) => a.distance - b.distance)
  const recommendations = sortedCourses

  const relevantRecommendations = relevantCourses(recommendations, userCoordinates)

  const allRecommendations= {
    relevantRecommendations: relevantRecommendations,
    recommendations: recommendations
  }
  
  const end = Date.now()
  console.log(`Execution time: ${end - startBench} ms`)
  return allRecommendations
}

export default recommendCourses
