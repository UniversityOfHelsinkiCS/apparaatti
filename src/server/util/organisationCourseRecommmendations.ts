import { organisationCodeToName } from '../../common/organisations.ts'
import type { CourseData, RecommendationCodeRow } from '../../common/types.ts'

export type CourseMatchCase = {
  language: string
  codes: string[] | null
  customCodeUrns: string[] | null
}

export const mentoringCourseCodes = [
  'KK-ENG301',
  'KK-ENG302',
  'KK-ENG303',
  'KK-RUO204',
  'KK-RUO205',
  'KK-RUO206',
  'KK-FIN01',
  'KK-FIN02',
  'KK-FIN08',
]

export const finmuMentoringCourseCodes = ['KK-FINMU'] // is this deprecated?

export const challegeCourseCodes: CourseMatchCase[] = [
  {
    language: 'en-secondary',
    codes: ['KK-ENERI'],
    customCodeUrns: null,
  },
  {
    language: 'sv-secondary',
    codes: ['KK-RUERI'],
    customCodeUrns: null,
  },
  {
    language: 'fi-secondary',
    codes: null,
    customCodeUrns: ['kks-kor'],
  },
  {
    //fi is split into spoken and written but currently both are put under fi-primary
    language: 'fi-primary',
    codes: ['KK-AIAKVUERI'],
    customCodeUrns: ['kks-kor'],
  },
  {
    //svedish as a primary currently does not have any courses
    //that should be recommended to help with challenges
    language: 'sv-primary',
    codes: null,
    customCodeUrns: null,
  },
  {
    //same for english primary
    language: 'en-primary',
    codes: null,
    customCodeUrns: null,
  },
]

export function courseHasAnyOfCodes(course: CourseData, codes: string[] | null) {
  if (!codes) {
    return false
  }
  for (const code of course.courseCodes) {
    if (codes.find(co => co === code)) {
      return true
    }
  }
  return false
}

export function courseHasCustomCodeUrn(course: CourseData, codeUrn: string | null) {
  if (!codeUrn) {
    return false
  }
  const customCodeUrns = course.customCodeUrns
  if (customCodeUrns === null) {
    return false
  }
  return urnInCustomCodeUrns(course.customCodeUrns, codeUrn)
}

export function urnInCustomCodeUrns(customCodeUrns: Record<string, string[]> | null, codeUrn: string | null) {
  if (!customCodeUrns) {
    return false
  }
  if (!codeUrn) {
    return false
  }

  for (const key of Object.keys(customCodeUrns)) {
    if (key.includes('kk-apparaatti')) {
      const values = customCodeUrns[key]
      const hasCodeUrn = values.find(val => val.includes(codeUrn))
      if (hasCodeUrn) {
        return true
      }
    }
  }

  return false
}

export function courseHasAnyCustomCodeUrn(course: CourseData, codeUrns: string[] | null) {
  if (!codeUrns) {
    return false
  }

  for (const urn of codeUrns) {
    const found = courseHasCustomCodeUrn(course, urn)
    if (found) {
      return true
    }
  }

  return false
}

export function courseMatches(course: CourseData, cases: CourseMatchCase[], languageToStudy: string) {
  const matchCase: CourseMatchCase | undefined = cases.find(m => m.language === languageToStudy)
  if (matchCase === undefined) {
    return false
  }

  const codesMatch = courseHasAnyOfCodes(course, matchCase.codes)
  const codeUrnsMatch = courseHasAnyCustomCodeUrn(course, matchCase.customCodeUrns)

  return codesMatch || codeUrnsMatch
}

//returns a string telling wheter or not the language to be studied is primary or secondary
//for example: if ('fi', 'fi') -> 'fi-primary' and if ('sve', 'fi') -> 'sve-secondary'
export function languageToStudy(langCode: string, primaryLanguage: string): string {
  if (langCode === primaryLanguage) {
    return langCode + '-primary'
  } else {
    return langCode + '-secondary'
  }
}

function specificationsToMatch(primaryLanguageSpecification: string): string[] {
  if (primaryLanguageSpecification === 'spoken') return ['spoken']
  if (primaryLanguageSpecification === 'written') return ['written']
  if (primaryLanguageSpecification === 'writtenAndSpoken') return ['spoken', 'written']
  return []
}

export function codesForAnswers(
  rows: RecommendationCodeRow[],
  organisationCode: string,
  langCode: string,
  primaryLanguage: string,
  primaryLanguageSpecification: string
): string[] {
  const languageType = langCode === primaryLanguage ? 'primary' : 'secondary'
  const specifications = specificationsToMatch(primaryLanguageSpecification)

  return rows
    .filter(row => row.organisationCode === organisationCode)
    .filter(row => row.lang === langCode)
    .filter(row => row.languageType === null || row.languageType === languageType)
    .filter(
      row => row.primaryLanguageSpecification === null || specifications.includes(row.primaryLanguageSpecification)
    )
    .map(row => row.courseCode)
}

export function codesForOrganisation(rows: RecommendationCodeRow[], organisationCode: string): string[] {
  return rows.filter(row => row.organisationCode === organisationCode).map(row => row.courseCode)
}

export { organisationCodeToName }
