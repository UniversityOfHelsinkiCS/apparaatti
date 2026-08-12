/**
 * Turns data/data.xlsx into data/data.ts, the typed object the server reads at runtime.
 * The xlsx stays the source of truth, it is just not parsed at runtime any more.
 *
 * Run with: npm run generate:organisation-data
 */
import fs from 'fs'
import path from 'path'
import xlsx from 'xlsx'

import { organisationCodeToName } from '../src/common/organisations.ts'
import type { OrganisationRecommendation } from '../src/server/util/organisationCourseRecommmendations.ts'

type Language = OrganisationRecommendation['languages'][number]

const parseWorkbook = (filePath: string): OrganisationRecommendation[] => {
  const workbook = xlsx.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as string[][]

  if (data.length < 2) return []

  const headers: string[] = data[0]
  const dataRows = data.slice(1)

  const codesWithLanguages = dataRows.map((row: string[]) => {
    const name = row[0]

    const codes = Object.keys(organisationCodeToName).filter(key => name.includes(organisationCodeToName[key]))

    const languages: Language[] = []

    for (let i = 1; i < headers.length; i++) {
      const langName = headers[i]
      const codesRaw = row[i]

      if (codesRaw && codesRaw.trim()) {
        const codes = codesRaw
          .split('\n')
          .map(c => c.trim())
          .filter(Boolean)
        languages.push({ name: langName, codes })
      }
    }

    return { codes, languages }
  })

  const codeAndLanguages: OrganisationRecommendation[] = []
  for (const entry of codesWithLanguages) {
    for (const code of entry.codes) {
      codeAndLanguages.push({ name: code, languages: entry.languages })
    }
  }

  return codeAndLanguages
}

const recommendations = parseWorkbook(path.resolve(import.meta.dirname, '../data/data.xlsx'))

const fileContents = `//GENERATED FILE, do not edit by hand
//regenerate from data/data.xlsx with: npm run generate:organisation-data
import type { OrganisationRecommendation } from '../src/server/util/organisationCourseRecommmendations.ts'

export const organisationRecommendations: OrganisationRecommendation[] = ${JSON.stringify(recommendations, null, 2)}
`

fs.writeFileSync(path.resolve(import.meta.dirname, '../data/data.ts'), fileContents)

console.log(`wrote data/data.ts with ${recommendations.length} organisations`)
