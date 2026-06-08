import type { AnswerData, CourseData, CourseRecommendation, CourseRecommendations, UserCoordinates } from '../../common/types.ts'
import { uniqueVals } from './misc.ts'
import type { OrganisationRecommendation } from './organisationCourseRecommmendations.ts'
import {challegeCourseCodes, codesInOrganisations, courseHasAnyOfCodes, courseHasCustomCodeUrn, courseMatches, finmuMentroingCourseCodes, getUserOrganisationRecommendations, languageSpesificCodes, languageToStudy, mentoringCourseCodes, readOrganisationRecommendationData } from './organisationCourseRecommmendations.ts'
import { dateObjToPeriod, getCoursePeriod, getStudyPeriod, parseDate, getStudyYear } from './studyPeriods.ts'
import { curcusWithUnitIdOf, curWithIdOf, cuWithCourseCodeOf, organisationWithGroupIdOf } from './dbActions.ts'
import pointRecommendedCourses from './pointRecommendCourses.ts'
import { collaborationOrganisationNames, collaborationOrganisationCourseNameIncludes, correctValue, incorrectValue, notAnsweredValue, organisationCodeToUrn, bonusPoint } from './constants.ts'
import { courseStudyPlaceCoordinate, getNormalizedStudyPlace, isExam, isIndependentCourse, readStudyPlaceCoordinate } from './studyPlace.ts'
import { C } from 'vitest/dist/chunks/reporters.d.BuRON0I0.js'

export { courseStudyPlaceCoordinate, getNormalizedStudyPlace, isExam, isIndependentCourse, readArrOrSingleValue, readStudyPlaceCoordinate } from './studyPlace.ts'

async function recommendCourses(
  answerData: AnswerData,
  strictFields: string[] = []
) {
  const userCoordinates: UserCoordinates = calculateUserCoordinates(answerData)
  const recommendations = await getRecommendations(userCoordinates, answerData, strictFields)

  return recommendations
}

export function commonCoordinateFromAnswerData(value: string, yesValue: number, noValue: number, neutralValue: number | null){
  switch(value){
  case '1':
    return yesValue
  case '0':
    return noValue
  case 'neutral':
    return neutralValue
  }
}

export function readAnswer(answerData: AnswerData, key: keyof AnswerData): string | string[]{
  const value = answerData[key]
  if(!value || (Array.isArray(value) && value.length === 0)){
    return 'neutral'
  }
  return value
}

export function readAsStringArr(variable: string[] | string): string[]{
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
    org: correctValue, // courses that have the same organisation will get the coordinate of 1 as well and the ones that are not get a big number, thus leading to better ordering of courses 
    spesificOrg: correctValue, //there are generic courses for everybody, and then there are spesific courses for the organisation of the user. When a course is not generic course and is for the user then this coordinate is the same
    lang: correctValue, // courses that have the same language as the user will get the coordinate of 0 as well and the ones that are not will get a big number
    graduation: commonCoordinateFromAnswerData(readAnswer(answerData, 'graduation'), correctValue, incorrectValue, notAnsweredValue),
    mentoring: commonCoordinateFromAnswerData(readAnswer(answerData, 'mentoring'), correctValue, incorrectValue, notAnsweredValue),
    finmu: commonCoordinateFromAnswerData(readAnswer(answerData, 'finmu'), correctValue, incorrectValue, notAnsweredValue),
    integrated: commonCoordinateFromAnswerData(readAnswer(answerData, 'integrated'), correctValue, incorrectValue, notAnsweredValue),
    studyPlace:  readStudyPlaceCoordinate(answerData), // courses that have the correct studyPlace based on the answerData will get coord of 1.
    replacement: commonCoordinateFromAnswerData(readAnswer(answerData, 'replacement'), correctValue, incorrectValue, notAnsweredValue),
    challenge: commonCoordinateFromAnswerData(readAnswer(answerData, 'challenge'), correctValue, incorrectValue, notAnsweredValue),
    independent: commonCoordinateFromAnswerData(readAnswer(answerData, 'independent'), correctValue, incorrectValue, notAnsweredValue),
    flexible: commonCoordinateFromAnswerData(readAnswer(answerData, 'flexible'), correctValue, incorrectValue, notAnsweredValue),
    mooc: commonCoordinateFromAnswerData(readAnswer(answerData, 'mooc'), correctValue, incorrectValue, notAnsweredValue),
    collaboration: commonCoordinateFromAnswerData(readAnswer(answerData, 'collaboration'), correctValue, incorrectValue, incorrectValue),
    studyYear: readAnswer(answerData, 'study-year'),
    studyPeriod: readAsStringArr(readAnswer(answerData, 'study-period')),
    multiPeriod: commonCoordinateFromAnswerData(readAnswer(answerData, 'multi-period'), correctValue, incorrectValue, null),
  }
  return userCoordinates
}

//generic courses have many cases where they are considered to be for the users organisation
export async function courseInSameOrganisationAsUser(course: CourseData, organisationCode: string, codesInOrganisation: string[]){
  const isSpesificForUserOrg = courseIsSpesificForUserOrg(course, organisationCode)
  if(isSpesificForUserOrg){
    return isSpesificForUserOrg
  }

  const organisations  = await organisationWithGroupIdOf(course.groupIds)
  const orgCodes = organisations.map(o => o.code)
  if(orgCodes.includes(organisationCode)){
    return true
  }

  //there are courses that are not marked with customCodeUrn and do not have an organisationCode marked on them, in that case we fall back to hard coded lookup exel =)
  const courseCodeIsForOrganisation = courseHasAnyOfCodes(course, codesInOrganisation)
  if(courseCodeIsForOrganisation){
    return true
  }

  return false
} 


export function courseIsSpesificForUserOrg(course: CourseData, organisationCode: string){
  const codes = [organisationCode]
  for(const code of codes){
    const urnHit = organisationCodeToUrn[code]
    if(urnHit){
      const hasCustomCodeUrn = courseHasCustomCodeUrn(course, urnHit)
      if(hasCustomCodeUrn){
        return true
      } 
    }
  }

  return false
}

export function localeNameIncludesAny(localizedName: { fi?: string; en?: string; sv?: string } | undefined, patterns: string[]): boolean {
  const nameFi = localizedName?.fi?.toLowerCase() || ''
  const nameEn = localizedName?.en?.toLowerCase() || ''
  const nameSv = localizedName?.sv?.toLowerCase() || ''
  
  for (const pattern of patterns) {
    const lowerPattern = pattern.toLowerCase()
    if (nameFi.includes(lowerPattern) || 
        nameEn.includes(lowerPattern) || 
        nameSv.includes(lowerPattern)) {
      return true
    }
  }
  
  return false
}

export async function courseIsCollaboration(course: CourseData): Promise<boolean> {
  if (localeNameIncludesAny(course.name, collaborationOrganisationCourseNameIncludes)) {
    return true
  }
  
  const organisations = await organisationWithGroupIdOf(course.groupIds)
  
  for (const org of organisations) {
    const orgName = org.name as any
    if (localeNameIncludesAny(orgName, collaborationOrganisationNames)) {
      return true
    }
  }
  
  return false
}

async function calculateCourseCoordinates(course: CourseData, userCoordinates: UserCoordinates, codes: courseCodes,  courseLanguageType: string, organisationCode:string, answerData: AnswerData
): Promise<CourseRecommendation> {
  
  
  
  const sameOrganisationAsUser = await courseInSameOrganisationAsUser(course, organisationCode, codes.userOrganisation)

  const courseIsSpesific = courseIsSpesificForUserOrg(course, organisationCode)

  const correctLang = courseHasAnyOfCodes(course, codes.languageSpesific)
 
  const hasGraduationCodeUrn = courseHasCustomCodeUrn(course, 'kks-val') || courseHasCustomCodeUrn(course, 'kkt-val') 
  const hasIntegratedCodeUrn = courseHasCustomCodeUrn(course, 'kks-int') 
  const hasReplacementCodeUrn = courseHasCustomCodeUrn(course, 'kks-kor')
  const hasFlexibleCodeUrn = courseHasCustomCodeUrn(course, 'kks-jou')
  const hasMoocCodeUrn = courseHasCustomCodeUrn(course, 'opintotarjonta:mooc')  

  const isIndependent = isIndependentCourse(course)
  const isMentoringCourse =  courseHasAnyOfCodes(course, mentoringCourseCodes)
  const isFinmuMentoringCourse = courseHasAnyOfCodes(course, finmuMentroingCourseCodes)

  const isChallengeCourse = courseMatches(course, challegeCourseCodes, courseLanguageType)
  const isCollaboration = await courseIsCollaboration(course)
  const isMultiPeriod = courseSpansMultiplePeriods(course)
  
  const courseCoordinates = {
    date: course.startDate.getTime(),  
    org: sameOrganisationAsUser === true ? correctValue : incorrectValue, // there is a offset value for this field to make sure that different organisation leads to a really high distance
    spesificOrg: courseIsSpesific === true ? correctValue : incorrectValue,
    lang: correctLang === true ? correctValue : incorrectValue, // if the course is different language than the users pick we want to have it very far away. 
    graduation: hasGraduationCodeUrn ? correctValue : incorrectValue,
    mentoring: isMentoringCourse ? correctValue : incorrectValue,
    finmu: isFinmuMentoringCourse ? correctValue : incorrectValue, 
    integrated: hasIntegratedCodeUrn ? correctValue : incorrectValue,
    studyPlace: courseStudyPlaceCoordinate(course, answerData),
    replacement:  hasReplacementCodeUrn ? correctValue : incorrectValue,
    challenge: isChallengeCourse ? correctValue : incorrectValue,
    independent: isIndependent ? correctValue : incorrectValue,
    flexible: hasFlexibleCodeUrn ? correctValue : incorrectValue,
    mooc: hasMoocCodeUrn ? correctValue : incorrectValue,
    collaboration: isCollaboration ? correctValue : incorrectValue,
    multiPeriod: isMultiPeriod ? correctValue : incorrectValue,
  }

  

  return { course: course, coordinates: courseCoordinates }
}

//returns a list of courseRecommendation
// the coordinates field can then be used in recommending the course (currently using point based)
async function calculateAllCourseCoordinates(
  userCoordinates: UserCoordinates,
  availableCourses: CourseData[],
  courseCodes: courseCodes,
  courseLanguageType: string,
  organisationCode:string,
  answerData: AnswerData
): Promise<CourseRecommendation[]> {
  const distancePromises = availableCourses.map((course) => {
    return calculateCourseCoordinates(course, userCoordinates, courseCodes, courseLanguageType, organisationCode, answerData)
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
      const courseData = {
        ...cur,
        period: getCoursePeriod(cur),
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

      
      return {
        ...courseData,
        normalizedStudyPlace: getNormalizedStudyPlace(courseData), 
      }
    }
  )
 
  return courseRealisationsWithCodes
}

export function courseSpansMultiplePeriods(course: CourseData): boolean {
  return (course.period?.length ?? 0) > 1
}

const getPeriodsWantedByUser = (periodsArg) => {
  const periods = readAsStringArr(periodsArg)
  if(periods.includes('neutral') || periods.length === 0){
    return ['intensive_3_previous', 'period_1', 'period_2', 'period_3', 'period_4', 'intensive_3']     
  }
  return periods
}

const getStudyYearFromPeriod = (_id: string) => {
  const today = new Date()
  const currentPeriod = dateObjToPeriod(today)[0]
  const currentPeriodDate = parseDate(currentPeriod['start_date'])
  const currentStudyYearStart = currentPeriodDate.getFullYear()
  return currentStudyYearStart.toString()
}

//Takes a list of period names or a single period name and returns a list of periods that are in the current study year of the user
//For example if it is autumn 2024 and the user picks sends: [period_1, period_4] -> [{period that starts in autumn in 2024}, {period that starts in spring in 2025}]
export function getRelevantPeriods(periodsArg: string[] | string) {
  const periods = getPeriodsWantedByUser(periodsArg)

  const pickedPeriods = periods.map((period: string) => {
    const startYearOfPeriod = getStudyYearFromPeriod(period)
    const pickedPeriod = getStudyPeriod(startYearOfPeriod, period)
    return pickedPeriod
  })
 
  return pickedPeriods
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
  const allCodes = codesInOrganisations(organisationRecommendations)
  const userOrganisations = getUserOrganisationRecommendations(userOrganisationCode, organisationRecommendations)
  const organisationCodes = codesInOrganisations(userOrganisations)
  const languageSpesific = languageSpesificCodes(userOrganisations, langCode, primaryLanguage, primaryLanguageSpecification)  

  return {
    all: allCodes, 
    userOrganisation: organisationCodes, 
    languageSpesific: languageSpesific, 
  }
}

function shouldUseStrictSpecificOrg(lang: string, primaryLanguage: string) {
  return lang === primaryLanguage && (lang === 'fi' || lang === 'sv')
}




async function getRecommendations(userCoordinates: UserCoordinates, answerData: AnswerData, strictFields: string[]): Promise<CourseRecommendations> {

  const lang = readAnswer(answerData, 'lang')
  const primaryLang = readAnswer(answerData, 'primary-language')
  const primaryLangSpec = readAnswer(answerData, 'primary-language-specification')
  const organisationCode = readAnswer(answerData, 'study-field-select')

  const organisationRecommendations = readOrganisationRecommendationData()
  const courseCodes = getCourseCodes(lang, primaryLang, primaryLangSpec, organisationRecommendations, organisationCode)
  const strictFieldsWithLang = shouldUseStrictSpecificOrg(lang, primaryLang)
    ? uniqueVals([...strictFields, 'spesificOrg'])
    : strictFields

  const courseData = await getRealisationsWithCourseUnitCodes(courseCodes.languageSpesific) 
  const courseLanguageType = languageToStudy(lang, primaryLang)
  const recommendations = await calculateAllCourseCoordinates(userCoordinates, courseData, courseCodes, courseLanguageType, organisationCode, answerData )


  const pointBasedRecommendations = pointRecommendedCourses(recommendations, userCoordinates, strictFieldsWithLang)

  const allRecommendations = {
    pointBasedRecommendations: pointBasedRecommendations,
    userCoordinates: userCoordinates,
  }
  
  return allRecommendations
}


function isChallengeCourse (course: CourseData, courseLanguageType: string) {
   return courseMatches(course, challegeCourseCodes, courseLanguageType)
}

function isMentoringCourse (course: CourseData){
  return  courseHasAnyOfCodes(course, mentoringCourseCodes)

}

//returns courses ordered by heuristic rules
function sortCourseData(courseDatas: CourseData[], courseLanguageType: string): CourseData[]{
      const datasWithPoints = courseDatas.map((c) => {
      // Bonus point tiers (when no other filters active):
      //   1. faculty-specific mandatory (RUFARM, RUMATLU, ENLAAK…) → 4×
      //   2. generic / KAIKKI                                       → 3×
      //   3. numbered (ENG-201, RUO-205…)                          → 2×
      //   4. ERI / challenge                                        → 0× (unless user wants challenge)
      const isEriOrChallenge  = isChallengeCourse(c, courseLanguageType) || c.courseCodes.some(code => code.includes('ERI'))
      const isGeneric = c.courseCodes.some(code => code.includes('KAIKKI'))
      // const isNumbered = c.course.courseCodes.some(code => /\d+$/.test(code))
  
      //those courses that are not mentoring courses are mandatory courses
      //courses that are mentoring courses (value of 1) are usually numbered courses
      const isMandatory = isMentoringCourse(c) 
  
      let bonusPoints = 0
      if (!isEriOrChallenge) {
        if (isMandatory && !isGeneric)  bonusPoints = bonusPoint * 5  // tier 1: faculty-specific
        else if (isGeneric)  bonusPoints = bonusPoint * 4  // tier 2: KAIKKI
        else if (!isMandatory) bonusPoints = bonusPoint * 3  // tier 3: numbered
      }
      return{
        ...c,
        points: bonusPoints
      }
    })
    .sort((a, b) => a.points - b.points)
   
    return datasWithPoints satisfies CourseData[]
}

export async function getCourseData(answerData: AnswerData): Promise<CourseData[]> {

  const lang: string = readAnswer(answerData, 'lang')
  const primaryLang = readAnswer(answerData, 'primary-language')
  const primaryLangSpec = readAnswer(answerData, 'primary-language-specification')
  const organisationCode = readAnswer(answerData, 'study-field-select')

  const organisationRecommendations = readOrganisationRecommendationData()
  const courseCodes = getCourseCodes(lang, primaryLang, primaryLangSpec, organisationRecommendations, organisationCode)

  const courseData = await getRealisationsWithCourseUnitCodes(courseCodes.languageSpesific) 
  const courseLanguageType = languageToStudy(lang, primaryLang)


  
  const sorted = sortCourseData(courseData, courseLanguageType)
  
  return sorted
}



export default recommendCourses
