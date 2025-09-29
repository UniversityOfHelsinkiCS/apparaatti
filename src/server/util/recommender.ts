import type { AnswerData, CourseData, CourseRecommendation, CourseRecommendations, PointsCourseRecommendation, UserCoordinates } from '../../common/types.ts'
import { uniqueVals } from './misc.ts'
import type { OrganisationRecommendation } from './organisationCourseRecommmendations.ts'
import {challegeCourseCodes, codesInOrganisations, courseHasAnyOfCodes, courseHasCustomCodeUrn, courseMatches, getUserOrganisationRecommendations, languageSpesificCodes, languageToStudy, mentoringCourseCodes, readOrganisationRecommendationData } from './organisationCourseRecommmendations.ts'
import { dateObjToPeriod, getStudyPeriod, parseDate } from './studyPeriods.ts'
import { curcusWithUnitIdOf, curWithIdOf, cuWithCourseCodeOf, organisationWithGroupIdOf } from './dbActions.ts'

const getStudyYearFromPeriod = (id: string) => {
  const today = new Date()
  const currentPeriod = dateObjToPeriod(today)[0]
  const currentPeriodDate = parseDate(currentPeriod['start_date'])
  const currentStudyYearStart = currentPeriodDate.getFullYear()
  return currentStudyYearStart.toString()
}

async function recommendCourses(answerData: AnswerData) {
  try{
    const userCoordinates: UserCoordinates = calculateUserCoordinates(answerData)
    console.log('usercoords done')
    const recommendations = await getRecommendations(userCoordinates, answerData)

    return recommendations
  }
  catch(e)
  {
    return {}
  }
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


function commonCoordinateFromAnswerData(value: string, yesValue: number, noValue: number, neutralValue: number | null){
  switch(value){
  case '1':
    return yesValue
  case '0':
    return noValue
  case 'neutral':
    return neutralValue
  }
}

function readAnswer(answerData: AnswerData, key: string){
  const value = answerData[key]
  if(!value){
    return 'neutral'
  }
  return value
}

function readAsStringArr(variable: string[] | string): string[]{
  return Array.isArray(variable) ? variable : [variable]
}

function getDateFromUserInput(answerData: AnswerData){
  const periods = getRelevantPeriods(readAnswer(answerData, 'study-period'))
  const pickedPeriod = periods[0]
  return new Date(parseDate(pickedPeriod.start_date)).getTime()
}

function calculateUserCoordinates(answerData: AnswerData) {
  const userCoordinates = {
    //  'period': convertUserPeriodPickToFloat(readAnswer(answerData, 'study-period')),
    date: getDateFromUserInput(answerData),
    org: 0, // courses that have the same organisation will get the coordinate of 0 as well and the ones that are not get a big number, thus leading to better ordering of courses 
    lang: 0, // courses that have the same language as the user will get the coordinate of 0 as well and the ones that are not will get a big number
    graduation: commonCoordinateFromAnswerData(readAnswer(answerData, 'graduation'), Math.pow(10, 12), 0, null),
    mentoring: commonCoordinateFromAnswerData(readAnswer(answerData, 'mentoring'), Math.pow(10, 12), 0, null),
    integrated: commonCoordinateFromAnswerData(readAnswer(answerData, 'integrated'), Math.pow(10, 12), 0, null),
    studyPlace:  studyPlaceCoordinate(readAnswer(answerData, 'study-place')),
    replacement: commonCoordinateFromAnswerData(readAnswer(answerData, 'replacement'), Math.pow(10, 24), 0, null),
    challenge: commonCoordinateFromAnswerData(readAnswer(answerData, 'challenge'), Math.pow(10, 24), 0, null),
    independent: commonCoordinateFromAnswerData(readAnswer(answerData, 'independent'), Math.pow(10, 24), 0, null),
    flexible: commonCoordinateFromAnswerData(readAnswer(answerData, 'flexible'), Math.pow(10, 24), 0, null),
    mooc: commonCoordinateFromAnswerData(readAnswer(answerData, 'mooc'), Math.pow(10, 24), 0, null),
  }
  return userCoordinates
}

export const organisationCodeToUrn: Record<string, string> = {
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

async function courseInSameOrganisationAsUser(course: CourseData, organisationCode: string){
  const codes = [organisationCode]
  // console.log(codes)
  for(const code of codes){
    const urnHit = organisationCodeToUrn[code]
    if(urnHit){
      return courseHasCustomCodeUrn(course, urnHit)
    }
  }
  const organisations  = await organisationWithGroupIdOf(course.groupIds)

  const orgCodes = organisations.map(o => o.code)
  if( organisationCode in orgCodes){
    return true
  }
  //there are courses that are not marked with customCodeUrn and do not have an organisationCode marked on them, in that case we fall back to hard coded lookup exel =)
  const organisationSpesificCourseCodes =  readOrganisationRecommendationData()
  const courseCodesInOrganisation = organisationSpesificCourseCodes.find(r => r.name === organisationCode)
  if(courseCodesInOrganisation.includes(course.course.code)){
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

async function calculateCourseDistance(course: CourseData, userCoordinates: UserCoordinates, codes: courseCodes,  courseLanguageType: string, organisationCode:string
): Promise<CourseRecommendation> {
  
  const dimensions = Object.keys(userCoordinates)
  
  const sameOrganisationAsUser = await courseInSameOrganisationAsUser(course, organisationCode)
  const correctLang = courseHasAnyOfCodes(course, codes.languageSpesific)
 
  const hasGraduationCodeUrn = courseHasCustomCodeUrn(course, 'kks-val') || courseHasCustomCodeUrn(course, 'kkt-val') 
  const hasIntegratedCodeUrn = courseHasCustomCodeUrn(course, 'kks-int') 
  const hasReplacementCodeUrn = courseHasCustomCodeUrn(course, 'kks-kor')
  const hasFlexibleCodeUrn = courseHasCustomCodeUrn(course, 'kks-jou')
  const hasMoocCodeUrn = courseHasCustomCodeUrn(course, 'opintotarjonta:mooc')  

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
    flexible: hasFlexibleCodeUrn ? Math.pow(10, 24) : 0,
    mooc: hasMoocCodeUrn ? Math.pow(10, 24) : 0
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
  userCoordinates: UserCoordinates,
  availableCourses: CourseData[],
  courseCodes: courseCodes,
  courseLanguageType: string,
  organisationCode:string
): Promise<CourseRecommendation[]> {
  const distancePromises = availableCourses.map((course) => {
    return calculateCourseDistance(course, userCoordinates, courseCodes, courseLanguageType, organisationCode)
  })
  const distances = await Promise.all(distancePromises)
  return distances
}



export async function getRealisationsWithCourseUnitCodes(courseCodeStrings: string[]): Promise<CourseData[]> {


  const courseUnitsWithCodes = await cuWithCourseCodeOf(courseCodeStrings)
  const courseUnitIds = courseUnitsWithCodes.map((course) => course.id)
  const courseRealizationIdsWithCourseUnit = await curcusWithUnitIdOf(courseUnitIds)

  const wantedIds = courseRealizationIdsWithCourseUnit.map(
    (curCu) => curCu.curId
  )
  const courseRealizations = await curWithIdOf(wantedIds)
  
  const courseRealisationsWithCourseUnits =
    courseRealizations.map((cur) => {
      return {
        ...cur,
        unitIds: uniqueVals(courseRealizationIdsWithCourseUnit
          .filter((curcu) => curcu.curId === cur.id)
          .map((curcu) => curcu.cuId)),
      }
    })


  const courseRealisationsWithCodes: CourseData[] = courseRealisationsWithCourseUnits.map(
    (cur) => {
      return {
        ...cur,
        period: getPeriodForCourse(cur),
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
 
  return courseRealisationsWithCodes
}

const getPeriodForCourse = (cur) => {
    
  const studyPeriods = dateObjToPeriod(cur.startDate) 

  const studyPeriod = studyPeriods[0]
  if(!studyPeriod){
    console.log('no period found!')
    console.log(cur)
    console.log(studyPeriods)
    dateObjToPeriod(cur.startDate, true)
    return null
  }

  const period: Period = {
    name: studyPeriod.name,
    startDate: parseDate(studyPeriod.start_date),
    endDate: parseDate(studyPeriod.end_date)
  }
  return period
}

const getPeriodsWantedByUser = (periodsArg) => {
  const periods = readAsStringArr(periodsArg)
  if(periods.includes('neutral') || periods.length === 0){
    return ['intensive_3_previous', 'period_1', 'period_2', 'period_3', 'period_4', 'intensive_3']     
  }
  return periods
}
//Takes a list of period names or a single period name and returns a list of periods that are in the current study year of the user
//For example if it is autumn 2024 and the user picks sends: [period_1, period_4] -> [{period that starts in autumn in 2024}, {period that starts in spring in 2025}]
function getRelevantPeriods(periodsArg: string[] | string) {
  const periods = getPeriodsWantedByUser(periodsArg)

  const pickedPeriods = periods.map((period: string) => {
    const startYearOfPeriod = getStudyYearFromPeriod(period)
    const pickedPeriod = getStudyPeriod(startYearOfPeriod, period)
    return pickedPeriod
  })
 
  return pickedPeriods
}

//Returns true if the course starts or ends within any of the picked periods
function correctCoursePeriod(course: CourseRecommendation, pickedPeriods: { start_date: string; end_date: string; }[]): boolean
{
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
type courseCodes = {
  all: string[],
  userOrganisation: string[],
  languageSpesific: string[]
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
function getCourseCodes(langCode: string, primaryLanguage: string, primaryLanguageSpecification: string, organisationRecommendations: OrganisationRecommendation[], userOrganisationCode: string): courseCodes{
  const codeTimer = Date.now()
  const allCodes = codesInOrganisations(organisationRecommendations)
  const userOrganisations = getUserOrganisationRecommendations(userOrganisationCode, organisationRecommendations)
  const organisationCodes = codesInOrganisations(userOrganisations)
  const languageSpesific = languageSpesificCodes(userOrganisations, langCode, primaryLanguage, primaryLanguageSpecification)  

  const codeTimerE = Date.now()
  console.log('code time: ', codeTimerE - codeTimer)
  return {
    all: allCodes, 
    userOrganisation: organisationCodes, 
    languageSpesific: languageSpesific, 
  }
}
//applies a set of filters until the list of relevant courses is of certain lenght
function relevantCourses(courses: CourseRecommendation[], userCoordinates: UserCoordinates, answerData: AnswerData){
  const noExams = courses.filter(c => !c.course.name.fi?.toLowerCase().includes('tentti'))
 
  const pickedPeriods = getRelevantPeriods(readAnswer(answerData, 'study-period'))
  const comparisons = [
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.org === userCoordinates.org},
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return correctCoursePeriod(c, pickedPeriods)},
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.mooc === userCoordinates.mooc},
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.mentoring === userCoordinates.mentoring},
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.integrated === userCoordinates.integrated},
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.challenge === userCoordinates.challenge},
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.independent === userCoordinates.independent},
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.replacement === userCoordinates.replacement},
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.flexible === userCoordinates.flexible},
    (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.studyPlace === userCoordinates.studyPlace},
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
//returns a list of courses that are ordered/filtered based on a point based method
//each dimension is compared with a comparision and if it returns true the course gets a certain amount of points. If not the course does not get the points.
//this is different from the distance based sorting where two opposing coordinates seem to counter each other.
//In this point based one a difference does not punish as much as it gets 'ignored'
function pointRecommendedCourses(courses: CourseRecommendation[], userCoordinates: UserCoordinates, answerData: AnswerData): CourseRecommendation[]{
  const noExams = courses.filter(c => !c.course.name.fi?.toLowerCase().includes('tentti'))
 
  const pickedPeriods = getRelevantPeriods(readAnswer(answerData, 'study-period'))

  console.log('---DEBUG---')
  console.log(pickedPeriods)
  console.log('------')

  type ComparisonType = {
    filterOnFail: boolean,
    f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => boolean
  }
 
  const comparisons: ComparisonType[] = [
    {
      filterOnFail: false, 
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.org === userCoordinates.org}
    },
    {
      filterOnFail: true,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return correctCoursePeriod(c, pickedPeriods) === true}
    },
    {
      filterOnFail: true,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.lang === userCoordinates.lang}
    },
    {
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.mooc === userCoordinates.mooc}
    },
    {
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.mentoring === userCoordinates.mentoring}
    },
    {
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.integrated === userCoordinates.integrated}
    },
    {
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.challenge === userCoordinates.challenge}
    },
    {
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.independent === userCoordinates.independent}
    },
    {
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.replacement === userCoordinates.replacement}
    },
    {
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.flexible === userCoordinates.flexible}
    },
    {
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {return c.coordinates.studyPlace === userCoordinates.studyPlace}
    },
  ]
  console.log('count before: ', noExams.length)
 
  const recommendationWithPoints = noExams.map((c) => {
    let points = 0 

    for(const comp of comparisons){
      const comparison = comp.f(c, userCoordinates)
      if(comparison){
        points++
      }
      else{
        if(comp.filterOnFail === true){
          return {...c, points: -1}
        }
      }
    }

    return {...c, points}
  })

  const filtered = recommendationWithPoints.filter((r) => r.points >= 0)
  const sorted = filtered.sort((a, b) => b.points - a.points)
  return filtered
}

async function getRecommendations(userCoordinates: UserCoordinates, answerData: AnswerData): Promise<CourseRecommendations> {
  const organisationCode = readAnswer(answerData, 'study-field-select')

  const organisationRecommendations = readOrganisationRecommendationData()
  const courseCodes = getCourseCodes(readAnswer(answerData, 'lang-1'), readAnswer(answerData, 'primary-language'), readAnswer(answerData, 'primary-language-specification'), organisationRecommendations, organisationCode)

  const courseData = await getRealisationsWithCourseUnitCodes(courseCodes.languageSpesific) 

  const courseLanguageType = languageToStudy(readAnswer(answerData, 'lang-1'), readAnswer(answerData, 'primary-language'))
  const distances = await calculateUserDistances(userCoordinates, courseData, courseCodes, courseLanguageType, organisationCode )

  const sortedCourses = distances.sort((a, b) => a.distance - b.distance)
  const recommendations = sortedCourses
  const relevantRecommendations = relevantCourses(recommendations, userCoordinates, answerData)
  const pointBasedRecommendations = pointRecommendedCourses(recommendations, userCoordinates, answerData)
  const allRecommendations = {
    relevantRecommendations: relevantRecommendations,
    recommendations: recommendations,
    userCoordinates: userCoordinates,
    pointBasedRecommendations: pointBasedRecommendations
  }
  
  return allRecommendations
}

export default recommendCourses
