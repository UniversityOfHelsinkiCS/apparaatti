import fs from 'fs'
import Papa from 'papaparse'
import path from 'path'

let cachedData: object[] | null = null
let cachedCodeData: object[] | null = null

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

export function readCodeData(): Promise<object[]> {
  if (cachedCodeData) {
    return Promise.resolve(cachedCodeData)
  }

  const filePath = path.resolve(import.meta.dirname, '../../../data/recommended_course_data.csv')
  const fileContent = fs.readFileSync(filePath, 'utf8')

  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        cachedCodeData = results.data
        resolve(results.data)
      },
      error: (error: any) => reject(error),
    })
  })
}
