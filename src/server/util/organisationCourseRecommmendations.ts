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