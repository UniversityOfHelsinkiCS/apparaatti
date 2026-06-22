import type { AnswerData, CourseData } from '../../common/types.ts'
import {
  collaborationOrganisationCourseNameIncludes,
  collaborationOrganisationNames,
  organisationCodeToUrn,
} from './constants.ts'
import { curcusWithUnitIdOf, curWithIdOf, cuWithCourseCodeOf, organisationWithGroupIdOf } from './dbActions.ts'
import { uniqueVals } from './misc.ts'
import type { OrganisationRecommendation } from './organisationCourseRecommmendations.ts'
import {
  challegeCourseCodes,
  codesInOrganisations,
  courseHasAnyOfCodes,
  courseHasCustomCodeUrn,
  courseMatches,
  getUserOrganisationRecommendations,
  languageSpesificCodes,
  languageToStudy,
  mentoringCourseCodes,
  readOrganisationRecommendationData,
} from './organisationCourseRecommmendations.ts'
import { getCoursePeriod } from './studyPeriods.ts'
import { getNormalizedStudyPlace } from './studyPlace.ts'

export { getNormalizedStudyPlace, isExam, isIndependentCourse, readArrOrSingleValue } from './studyPlace.ts'

export function commonCoordinateFromAnswerData(
  value: string,
  yesValue: number,
  noValue: number,
  neutralValue: number | null
) {
  switch (value) {
    case '1':
      return yesValue
    case '0':
      return noValue
    case 'neutral':
      return neutralValue
  }
}

export function readAnswer(answerData: AnswerData, key: keyof AnswerData): string {
  const value = answerData[key]
  if (!value?.length) {
    return 'neutral'
  }
  return value
}

export function readAsStringArr(variable: string[] | string): string[] {
  return Array.isArray(variable) ? variable : [variable]
}

//generic courses have many cases where they are considered to be for the users organisation
export async function courseInSameOrganisationAsUser(
  course: CourseData,
  organisationCode: string,
  codesInOrganisation: string[]
) {
  const isSpesificForUserOrg = courseIsSpesificForUserOrg(course, organisationCode)
  if (isSpesificForUserOrg) {
    return isSpesificForUserOrg
  }

  const organisations = await organisationWithGroupIdOf(course.groupIds)
  const orgCodes = organisations.map(o => o.code)
  if (orgCodes.includes(organisationCode)) {
    return true
  }

  //there are courses that are not marked with customCodeUrn and do not have an organisationCode marked on them, in that case we fall back to hard coded lookup exel =)
  const courseCodeIsForOrganisation = courseHasAnyOfCodes(course, codesInOrganisation)
  if (courseCodeIsForOrganisation) {
    return true
  }

  return false
}

export function courseIsSpesificForUserOrg(course: CourseData, organisationCode: string) {
  const codes = [organisationCode]
  for (const code of codes) {
    const urnHit = organisationCodeToUrn[code]
    if (urnHit) {
      const hasCustomCodeUrn = courseHasCustomCodeUrn(course, urnHit)
      if (hasCustomCodeUrn) {
        return true
      }
    }
  }

  return false
}

export function localeNameIncludesAny(
  localizedName: { fi?: string; en?: string; sv?: string } | undefined,
  patterns: string[]
): boolean {
  const nameFi = localizedName?.fi?.toLowerCase() || ''
  const nameEn = localizedName?.en?.toLowerCase() || ''
  const nameSv = localizedName?.sv?.toLowerCase() || ''

  for (const pattern of patterns) {
    const lowerPattern = pattern.toLowerCase()
    if (nameFi.includes(lowerPattern) || nameEn.includes(lowerPattern) || nameSv.includes(lowerPattern)) {
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

export async function getRealisationsWithCourseUnitCodes(courseCodeStrings: string[]): Promise<CourseData[]> {
  const courseUnitsWithCodes = await cuWithCourseCodeOf(courseCodeStrings)
  const courseUnitIds = courseUnitsWithCodes.map(course => course.id)
  const courseRealizationIdsWithCourseUnit = await curcusWithUnitIdOf(courseUnitIds)

  const wantedIds = courseRealizationIdsWithCourseUnit.map(curCu => curCu.curId)
  const courseRealizations = await curWithIdOf(wantedIds)

  const courseRealisationsWithCourseUnits = courseRealizations.map(cur => {
    return {
      ...cur,
      unitIds: uniqueVals(
        courseRealizationIdsWithCourseUnit.filter(curcu => curcu.curId === cur.id).map(curcu => curcu.cuId)
      ),
    }
  })

  const courseRealisationsWithCodes: CourseData[] = courseRealisationsWithCourseUnits.map(cur => {
    const courseData = {
      ...cur,
      period: getCoursePeriod(cur),
      courseCodes: uniqueVals(courseUnitsWithCodes.filter(cu => cur.unitIds.includes(cu.id)).map(cu => cu.courseCode)),
      groupIds: uniqueVals(courseUnitsWithCodes.filter(cu => cur.unitIds.includes(cu.id)).map(cu => cu.groupId)),
      credits: courseUnitsWithCodes.filter(cu => cur.unitIds.includes(cu.id)).map(cu => cu.credits),
    }

    return {
      ...courseData,
      normalizedStudyPlace: getNormalizedStudyPlace(courseData),
    }
  })

  return courseRealisationsWithCodes
}

export function courseSpansMultiplePeriods(course: CourseData): boolean {
  return (course.period?.length ?? 0) > 1
}

type courseCodes = {
  all: string[]
  userOrganisation: string[]
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
function getCourseCodes(
  langCode: string,
  primaryLanguage: string,
  primaryLanguageSpecification: string,
  organisationRecommendations: OrganisationRecommendation[],
  userOrganisationCode: string
): courseCodes {
  const allCodes = codesInOrganisations(organisationRecommendations)
  const userOrganisations = getUserOrganisationRecommendations(userOrganisationCode, organisationRecommendations)
  const organisationCodes = codesInOrganisations(userOrganisations)
  const languageSpesific = languageSpesificCodes(
    userOrganisations,
    langCode,
    primaryLanguage,
    primaryLanguageSpecification
  )

  return {
    all: allCodes,
    userOrganisation: organisationCodes,
    languageSpesific: languageSpesific,
  }
}

function isChallengeCourse(course: CourseData, courseLanguageType: string) {
  return courseMatches(course, challegeCourseCodes, courseLanguageType)
}

function isMentoringCourse(course: CourseData) {
  return courseHasAnyOfCodes(course, mentoringCourseCodes)
}

//returns courses ordered by heuristic rules the order should be: RUFARM, RUKAIKKI, RU123, RUERI and the rest
export function sortCourseData(courseDatas: CourseData[], courseLanguageType: string): CourseData[] {
  const datasWithPoints = courseDatas
    .map(c => {
      const isEriOrChallenge =
        isChallengeCourse(c, courseLanguageType) || c.courseCodes.some(code => code.includes('ERI'))
      const isGeneric = c.courseCodes.some(code => code.includes('KAIKKI'))

      //those courses that are not mentoring courses are mandatory courses
      const isMentoring = isMentoringCourse(c)
      const isMandatory = !isMentoring

      let points = 0
      if (isEriOrChallenge) points = 1
      else if (isMandatory && !isGeneric)
        points = 4 // tier 1: faculty-specific
      else if (isGeneric) points = 3
      else if (isMentoring) points = 2 //numbered courses are usually mentoring courses

      return {
        ...c,
        points: points,
      }
    })
    .sort((a, b) => b.points - a.points)

  return datasWithPoints satisfies CourseData[]
}

function filterIfIsPrimaryLang(data: CourseData[], organisationCode: string, lang: string, primaryLang: string) {
  if (lang === primaryLang) {
    return data.filter(c => courseIsSpesificForUserOrg(c, organisationCode))
  } else {
    return data
  }
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

  const filteredForOrg = filterIfIsPrimaryLang(courseData, organisationCode, lang, primaryLang)
  const filteredRaj = filteredForOrg.filter(c => !courseHasCustomCodeUrn(c, 'kks-raj'))
  const sorted = sortCourseData(filteredRaj, courseLanguageType)

  return sorted
}
