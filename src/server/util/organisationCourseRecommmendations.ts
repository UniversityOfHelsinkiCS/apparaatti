import xlsx from 'xlsx'
import path from 'path'
type Language = {
  name: string
  codes: string[]
}

export type OrganisationRecommendation = {
  name: string
  languages: Language[]
}



export function getUserOrganisationRecommendations(studyData: any, data: OrganisationRecommendation[]){
  const userOrganisations = studyData.organisations
  const usersOrganisationCodes: string[] = userOrganisations.map((org: any) => org.code)
  const dataOrganisations = data.filter((org) => usersOrganisationCodes.includes(org.name))
  return dataOrganisations
}

export function codesInOrganisations(data: OrganisationRecommendation[]){
  return data.map((org) => org.languages.map((lang) => lang.codes).flat()).flat()
}


export function codesFromLanguagesContaining(organisationData: OrganisationRecommendation[], nameContains: string){
  return organisationData.map(
    (org) => org.languages.find((lang) => lang.name.includes(nameContains))?.codes)
    .flat()
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
      console.log('No primary language codes found')
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
      console.log('No secondary language codes found')
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