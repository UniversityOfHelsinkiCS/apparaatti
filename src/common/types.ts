export type UpdaterRunStatus = 'running' | 'success' | 'failed'

export type UpdaterRun = {
  id: number
  status: UpdaterRunStatus
  triggeredBy: string | null
  error: string | null
  startedAt: Date
  finishedAt: Date | null
}

export type Language = 'fi' | 'sv' | 'en'

export type LocalizedString = Partial<Record<Language, string>>

// Fully-specified localized string used for filter config stored in the DB
export type LocalizedText = Record<Language, string>

export type FilterOption = {
  id: string
  name: LocalizedText
  valueOverride?: string | null
  setStrict?: boolean | null
  selectedByDefault?: boolean | null
}

export type FilterVariant = {
  name: string
  skipped?: boolean
  question: LocalizedText
  explanation?: LocalizedText
  options?: FilterOption[]
}

export type FilterConfig = {
  id: string
  mandatory: boolean
  shortName: LocalizedText
  explanation?: LocalizedText
  extraInfo?: LocalizedText
  parentFilterId?: string | null
  displayOrder: number
  displayType?: string | null
  superToggle: boolean
  hideInCurrentFiltersDisplay: boolean
  hideInRecommendationReasons: boolean
  hideInFilterSidebar: boolean
  showInWelcomeModal: boolean
  coordinateKey?: string | null
  isStrictByDefault: boolean
  enabled: boolean
  variants: FilterVariant[]
}

export type Option = {
  id: string
  name: string
  valueOverride?: string
  setStrict?: boolean
  selectedByDefault?: boolean
}

export type Question = {
  id: string
  isSubQuestionForQuestionId?: string
  mandatory?: boolean
  value?: string
  shortName?: string
  explanation?: string
  variants: Variant[]
  extraInfo?: string
  displayType?: string | null
  superToggle?: boolean
  showInWelcomeModal?: boolean
  hideInCurrentFiltersDisplay?: boolean
  hideInRecommendationReasons?: boolean
  hideInFilterSidebar?: boolean
  coordinateKey?: string | null
  isStrictByDefault?: boolean
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

export type Period = {
  name: string
  startDate: Date
  endDate: Date
  startYear: string
  endYear: string
}

//this is a combination of a course realisation and course unit
//notes

export type CourseData = {
  id: string
  name: LocalizedString
  nameSpecifier?: LocalizedString | null
  startDate: Date
  endDate: Date
  period: Period[] | null
  customCodeUrns: Record<string, string[]>
  courseUnitRealisationTypeUrn: string

  //example: course that is considered as 'online' on the apparaatti side
  //may be marked as 'online', 'remote', 'distance' on the sisu side
  //the normalized studyplace makes it easier to check correcly
  normalizedStudyPlace?: string | null

  courseCodes: string[]
  groupIds: string[]
  unitIds: string[]
  credits: Record<string, number>[]
  flowState: string | null
}

export type CourseRealization = {
  id: string
  name: LocalizedString
  nameSpecifier: LocalizedString
  startDate: Date
  endDate: Date
  customCodeUrns: Record<string, string[]>
  courseUnitRealisationTypeUrn: string
  flowState: string
}

export type CourseAdminReviewType = {
  id: number
  curId: string
  reviewed: string // possible states: 'no' and 'yes', reason behind being a string is that in the future more states wil be wanted like 'changed' or 'todo'
  comment?: string
  createdAt: Date
  updatedAt: Date
}

export type CourseReviewState = CourseAdminReviewType | null

export type User = {
  id: string
  username: string
  hyGroupCn: string[] | null
  language: string | null
  studentNumber: string | null
  isAdmin?: boolean
  isSuperuser?: boolean
}

export type CurCuRelation = {
  cuId: string
  curId: string
}

export type FormSubmission = {
  answerData: AnswerData // choices of the form
  strictFields: string[] // list of fields of answerData that should be treated as
}

export type AnswerData = {
  'study-field-select': string
  lang: string
  'primary-language': string
  'primary-language-specification': string
}

export type UserVisit = {
  visitorHashHex: string
  date: Date
}

export type UserSettings = {
  educationLanguage: string
}

export type FilterStateValues = {
  primaryLanguage: string
  language: string
  primaryLanguageSpecification: string
  studyField: string
  previouslyDoneLang: string
  replacement: string
  mentoring: string
  finmu: string
  challenge: string
  graduation: string
  studyPlace: string[]
  studyYear: string
  studyPeriod: string[]
  integrated: string
  independent: string
  mooc: string
  collaboration: string
  multiPeriod: string
  flexible: string
}

export type RecommendationMetadata = {
  filterState?: FilterStateValues
  courses: CourseData[]
}

export type UserFeedbackSubmission = {
  textFeedback: string
  stars: number
  recommendationMetadata?: RecommendationMetadata
  appVersion?: string
}

export type UserFeedback = UserFeedbackSubmission & {
  id: number
  date: Date
}
