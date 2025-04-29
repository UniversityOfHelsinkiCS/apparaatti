import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

let cachedData: object[] | null = null

export function readCsvData(): Promise<object[]> {
  if (cachedData) {
    return Promise.resolve(cachedData)
  }

  const filePath = path.resolve(import.meta.dirname, '../../../data/course_data.test.csv')
  const fileContent = fs.readFileSync(filePath, 'utf8')

  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        cachedData = results.data
        resolve(results.data)
      },
      error: (error: any) => reject(error),
    })
  })
}