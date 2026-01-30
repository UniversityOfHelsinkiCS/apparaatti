export type LocalizedString = Partial<{
  fi: string
  sv: string
  en: string
}>

export type Option = {
  id: string
  name: string
  valueOverride?: string //if this field exists on a option it will be used as the value to send to the backend
  setStrict?: boolean //if true, this option will set the strict mode for the question, if false it will not force the strict mode to be true
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
  extraInfo?: string // Added extrainfo field
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


export type UserCoordinates = {
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
  finmu?: number | null;
  studyYear?: string | null;
  studyPeriod?: string[] | null;
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
  startYear: string,
  endYear: string
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
  nameSpecifier?: LocalizedString
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
  isAdmin?: boolean
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
  'study-year': string;
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
