export type LocalizedString = Partial<{
  fi: string
  sv: string
  en: string
}>

export type Option = {
  id: string
  name: string
}

export type Question = {
  id: string
  effects: string
  isSubQuestionForQuestionId?: string
  number: string
  mandatory?: boolean
  value?: string
  type: string
  explanation?: string
  variants: Variant[]
}

export type Variant = {
  name: string
  skipped?: boolean | undefined
  explanation?: string | undefined
  question: string
  options?: Option[]
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
  coordinates: CourseCoordinates
  points?: number
} 


export type CourseCoordinates = {
  date: number;
  org: number;
  lang: number;
  graduation?: number | null;
  mentoring?: number | null;
  integrated?: number | null;
  studyPlace: number;
  replacement?: number | null;
  challenge?: number | null;
  independent?: number | null;
  flexible?: number | null;
  mooc?: number | null;
}

export type UserCoordinates = CourseCoordinates;

export type CourseRecommendations = {
  recommendations: CourseRecommendation[]
  pointBasedRecommendations: CourseRecommendation[]
  userCoordinates: UserCoordinates  
  answerData?: AnswerData
}

export type Period = {
  name: string
  startDate: Date
  endDate: Date
}

//this is a combination of a course realisation and course unit
export type CourseData = {
  id: string
  name: LocalizedString
  startDate: Date
  endDate: Date
  period: null | Period
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
  isAdmin?: bool
 }

export type CurCuRelation = {
  cuId: string
  curId: string
}

export type FormSubmission = {
  answerData: AnswerData, // choices of the form
  strictFields: string[]  // list of fields of answerData that should be treated as 
}



export type AnswerData = {
  'study-period': string[] | string;
  'graduation': string;
  'mentoring': string;
  'integrated': string;
  'study-place': string;
  'replacement': string;
  'challenge': string;
  'independent': string;
  'flexible': string;
  'mooc': string;
  'study-field-select': string;
  'lang': string;
  'primary-language': string;
  'primary-language-specification': string;
};


export type adminFeedback = {
   recommendations: CourseRecommendations
   feedBack: string  
}
