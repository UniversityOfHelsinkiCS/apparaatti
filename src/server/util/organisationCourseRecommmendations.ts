import xlsx from 'xlsx'
import path from 'path'
import type { CourseRealization } from '../../common/types.ts'
type Language = {
  name: string
  codes: string[]
}

export type OrganisationRecommendation = {
  name: string
  languages: Language[]
}

export type CourseMatchCase = {
  language: string
  codes: string[] | null,
  customCodeUrns: string[] | null
}

export const mentoringCourseCodes =  [
  'KK-ENG301', 'KK-ENG302', 'KK-ENG303', 
  'KK-RUO204', 'KK-RUO205', 'KK-RUO206', 
  'KK-FIN01', 'KK-FIN02', 'KK-FIN08',
  
]

export const challegeCourseCodes: CourseMatchCase[]= [
  {
    language: 'en-secondary',
    codes:  ['KK-ENERI'],
    customCodeUrns: null
  },
  {
    language: 'sv-secondary',
    codes:  ['KK-RUERI'],
    customCodeUrns: null
  },
  {
    language: 'fi-secondary',
    codes: null,
    customCodeUrns: ['kks-kor']
  },
  { //fi is split into spoken and written but currently both are put under fi-primary
    language: 'fi-primary',
    codes: ['KK-AIAKVUERI'],
    customCodeUrns: ['kks-kor']
  },
  { 
    //svedish as a primary currently does not have any courses 
    //that should be recommended to help with challenges
    language: 'sv-primary',
    codes: null,
    customCodeUrns: null
  },
  {
    //same for english primary
    language: 'en-primary',
    codes: null,
    customCodeUrns: null
  }
]


export function courseHasAnyOfCodes(course: CourseRealization, codes: string[] | null){
  if(!codes){
    return false
  }
  for (const code of course.courseCodes){
    if(codes.includes(code)){
      return true
    }
  }

  return false
}

export function courseHasCustomCodeUrn(course: CourseRealization, codeUrn: string | null){
  if(!codeUrn){
    return false
  }
  const customCodeUrns = course.customCodeUrns
  if(customCodeUrns === null){
    return false
  }

  for(const key of Object.keys(customCodeUrns)){
    if(key.includes('kk-apparaatti')){
      const values = customCodeUrns[key]
      const hasCodeUrn = values.find((val) => val.includes(codeUrn))
      if(hasCodeUrn){
        return true
      }
    }
  }
  
  return false
}

export function urnInCustomCodeUrns(customCodeUrns: Record<string, string[]> | null, codeUrn: string | null){
  if(!customCodeUrns){
    return false
  }
  if(!codeUrn)
  {
    return false
  }
  
  for(const key of Object.keys(customCodeUrns)){
    if(key.includes('kk-apparaatti')){
      const values = customCodeUrns[key]
      const hasCodeUrn = values.find((val) => val.includes(codeUrn))
      if(hasCodeUrn){
        return true
      }
    }
  }
  
  return false
}

export function courseHasAnyCustomCodeUrn(course: CourseRealization, codeUrns: string[] | null)
{
  if(!codeUrns){
    return false
  }

  for(const urn of codeUrns){
    const found = courseHasCustomCodeUrn(course, urn)
    if(found){
      return true
    }
  }

  return false
}

export function courseMatches(course: CourseRealization, cases: CourseMatchCase[], languageToStudy: string)
{
  const matchCase: (CourseMatchCase | undefined) = cases.find((m) => m.language === languageToStudy)
  if(matchCase === undefined){
    return false
  }

  
  const codesMatch = courseHasAnyOfCodes(course, matchCase.codes) 
  const codeUrnsMatch = courseHasAnyCustomCodeUrn(course, matchCase.customCodeUrns)

  return codesMatch || codeUrnsMatch 
  
}


export function getUserOrganisationRecommendations(studyData: any, data: OrganisationRecommendation[]){
  const userOrganisations = studyData.organisations
  const usersOrganisationCodes: string[] = userOrganisations.map((org: any) => org.code)
  const dataOrganisations = data.filter((org) => usersOrganisationCodes.includes(org.name))
  return dataOrganisations
}

export function codesInOrganisations(data: OrganisationRecommendation[]): string[]{
  return data.map((org) => org.languages.map((lang) => lang.codes).flat()).flat()
}


export function codesFromLanguagesContaining(organisationData: OrganisationRecommendation[], nameContains: string): string[]{
  const codes: string[][] = []

  for (const org of organisationData){
    const languagesWithCorrectName = org.languages.filter((lang) => lang.name.includes(nameContains))
    const languageCodes = languagesWithCorrectName.map((lang) => lang.codes).flat()
    codes.push(languageCodes)
  }
 
  return codes.flat()
}

//returns a string telling wheter or not the language to be studied is primary or secondary
//for example: if ('fi', 'fi') -> 'fi-primary' and if ('sve', 'fi') -> 'sve-secondary'
export function languageToStudy(langCode: string, primaryLanguage: string): string{
  if(langCode === primaryLanguage){
    return langCode + '-primary'
  }
  else{
    return langCode + '-secondary'
  }
} 



export function languageSpesificCodes(organisationData: OrganisationRecommendation[], langCode: string, primaryLanguage: string ){
  //if the user picks the same language as the primary language then we want to return primary language course codes
  if(langCode === primaryLanguage ){
    switch(langCode){
    case 'fi':
      return codesFromLanguagesContaining(organisationData,'Äidinkieli, suomi')
    case 'sv':
      return codesFromLanguagesContaining(organisationData,'Äidinkieli, ruotsi')
    case 'en':
      return codesFromLanguagesContaining(organisationData,'Englanti') //english courses do not seem to have primary secodary split?
    default:
      return []
    }
  }
  //the codes differ so return secondary language course codes
  else{
    switch(langCode){
    case 'fi':
      return codesFromLanguagesContaining(organisationData,'Toinen kotimainen, suomi')
    case 'sv':
      return codesFromLanguagesContaining(organisationData,'Toinen kotimainen, ruotsi')
    case 'en':
      return codesFromLanguagesContaining(organisationData,'Englanti') //english courses do not seem to have primary secodary split?
    default:
      return []
    }
  }
}




export function readOrganisationRecommendationData(): OrganisationRecommendation[] {
  const filePath = path.resolve(
    import.meta.dirname,
    '../../../data/data.xlsx'
  )
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as string[][]

  if (data.length < 2) return []

  const headers: string[] = data[0]
  
  const dataRows = data.slice(1)
  
  return dataRows.map((row: string[]) => {
    const name = row[0]
    
    const languages: Language[] = []
    
    for (let i = 1; i < headers.length; i++) {
      const langName = headers[i]
      
      const codesRaw = row[i]
      
      if (codesRaw && codesRaw.trim()) {
        const codes = codesRaw.split('\n').map(c => c.trim()).filter(Boolean)
        languages.push({ name: langName, codes })
      }
    }

    return { name, languages }
  })}
