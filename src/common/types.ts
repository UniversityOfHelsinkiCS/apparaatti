export type LocalizedString = Partial<{
  fi: string
  sv: string
  en: string
}>

export type Option = {
  id: string
  name: LocalizedString
}

export type Question = {
  id: string
  value: string
  type: string
  explanation: string
  variants: Variant[]
}

export type Variant = {
  name: string
  question: LocalizedString
  options: Option[]
}

export type Form = {
  id: string
  questions: Question[]
}

export const DIMENSIONS = ['fear', 'teachingMethod', 'experience'] as const

export type Dimension = (typeof DIMENSIONS)[number]

export type CourseRecommendation = {
  course: CourseData
  distance: number
  coordinates: Record<string, number>
} 


export type CourseRecommendations = {
  relevantRecommendations: CourseRecommendation[]
  recommendations: CourseRecommendation[]
}
//this is a combination of a course realisation and course unit
export type CourseData = {
  id: string
  name: LocalizedString
  startDate: Date
  endDate: Date
  customCodeUrns: Record<string, string[]>
  courseUnitRealisationTypeUrn: string
  courseCodes: string[]
  groupIds: string[]
  unitIds: string[]
  credits: Record<string, number>[]
}

export type CourseRealization = {
  id: string
  name: LocalizedString
  startDate: Date
  endDate: Date
  customCodeUrns: Record<string, string[]>
  courseUnitRealisationTypeUrn: string

}


export type User = {
  id: string
  username: string
  hyGroupCn: string[] | null
  language: string | null
  studentNumber: string | null
 }

export type CurCuRelation = {
  cuId: string
  curId: string
}
