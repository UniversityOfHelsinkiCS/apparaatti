import type { MatchConditions } from './conditionMatching.ts'

/** How several selected URNs combine when filtering. */
export type UrnMatchMode = 'or' | 'and'

export type UniqueUrnResponse = {
  codeUrns: string[]
  typeUrns: string[]
}

export type UpdaterRunStatus = 'running' | 'success' | 'failed'

export type UpdaterRunKind = 'full' | 'courses'

export type UpdaterRun = {
  id: number
  status: UpdaterRunStatus
  runtype: UpdaterRunKind
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
  selectedByDefault?: boolean | null
}

export type FilterVariant = {
  name: string
  organisationCode: string | null
  lang: string | null
  primaryLanguage: string | null
  primaryLanguageSpecification: string | null
  skipped?: boolean
  question: LocalizedText
  explanation?: LocalizedText
  shortName?: LocalizedText
  extraInfo?: LocalizedText
  extraInfoDisabled?: boolean
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
  hideInCurrentFiltersDisplay: boolean
  hideInRecommendationReasons: boolean
  hideInFilterSidebar: boolean
  showInWelcomeModal: boolean
  coordinateKey?: string | null
  enabled: boolean
  variants: FilterVariant[]
}

export type Option = {
  id: string
  name: string
  nameLanguage?: Language
  valueOverride?: string
  selectedByDefault?: boolean
}

export type Question = {
  id: string
  isSubQuestionForQuestionId?: string
  mandatory?: boolean
  value?: string
  shortName?: string
  shortNameLanguage?: Language
  explanation?: string
  variants: Variant[]
  extraInfo?: string
  displayType?: string | null
  showInWelcomeModal?: boolean
  hideInCurrentFiltersDisplay?: boolean
  hideInRecommendationReasons?: boolean
  hideInFilterSidebar?: boolean
  coordinateKey?: string | null
  raw?: FilterConfig
}

export type Variant = {
  name: string
  organisationCode: string | null
  lang: string | null
  primaryLanguage: string | null
  primaryLanguageSpecification: string | null
  skipped?: boolean | undefined
  explanation?: string | undefined
  shortName?: string | undefined
  shortNameLanguage?: Language
  extraInfo?: string | undefined
  extraInfoDisabled?: boolean | undefined
  question: string
  questionLanguage?: Language
  options?: Option[]
  raw?: FilterVariant
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
  email?: string | null
  isAdmin?: boolean
  isSuperuser?: boolean
}

export type CurCuRelation = {
  cuId: string
  curId: string
}

export type FormSubmission = {
  answerData: AnswerData
}

export type AnswerData = {
  'study-field-select': string
  lang: string
  'primary-language': string
  'primary-language-specification': string
}

export type EducationPhase = {
  code?: string | null
  name?: LocalizedString | null
}

export type VisitStudyData = {
  organisationCode: string | null
  phase1ProgrammeCode: string | null
  phase1ProgrammeName: LocalizedString | null
  phase2ProgrammeCode: string | null
  phase2ProgrammeName: LocalizedString | null
}

export type UserVisit = {
  visitorHashHex: string
  date: Date
  organisationCode: string | null
  phase1ProgrammeCode: string | null
  phase1ProgrammeName: LocalizedString | null
  phase2ProgrammeCode: string | null
  phase2ProgrammeName: LocalizedString | null
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
  email?: string | null
}

export type BackendLocaleConditions = {
  organisationCode: string | null
  lang: string | null
  primaryLanguage: string | null
  primaryLanguageSpecification: string | null
}

export type BackendLocaleValue = BackendLocaleConditions & {
  id: number
  key: string
  text: LocalizedText
}

export type BackendLocaleKey = {
  id: number
  key: string
  description: string
  values: BackendLocaleValue[]
}

export type BackendLocaleContext = {
  organisationCode: string
  lang: string
  primaryLanguage: string
  primaryLanguageSpecification: string
}

export type ResolvedBackendLocales = Record<string, LocalizedText | null>

export type RecommendationLanguage = {
  id: number
  name: LocalizedText
  lang: string
  languageType: string | null
  primaryLanguageSpecification: string | null
}

export type RecommendationCode = {
  id: number
  organisationCode: string
  languageId: number
  courseCode: string
  language?: RecommendationLanguage
}

export type RecommendationCodeRow = {
  organisationCode: string
  lang: string
  languageType: string | null
  primaryLanguageSpecification: string | null
  courseCode: string
}

export type CourseTagMode = 'add' | 'ignore'

export type CourseTagOrigin = 'apparaatti' | 'customCodeUrn'

export type CourseTag = {
  id: number | null
  key: string
  description: string | null
  origin: CourseTagOrigin
}

export type CurTagRow = {
  curId: string
  tagKey: string
  mode: CourseTagMode
}

export type CuTagRow = {
  cuId: string
  tagKey: string
}

export type ApparaattiTagSource = 'added' | 'inherited'

export type ResolvedCurTag = {
  key: string
  apparaatti: ApparaattiTagSource | null
  fromCustomCodeUrn: boolean
  ignored: boolean
}

export type CurTagState = {
  inheritedByCur: Map<string, string[]>
  rowsByCur: Map<string, CurTagRow[]>
  customCodeUrnKeysByCur: Map<string, string[]>
}

export type TagSnapshotPayload = {
  appVersion?: string
  exportedAt?: string
  tags: Pick<CourseTag, 'key' | 'description'>[]
  cuTags: CuTagRow[]
  curTags: CurTagRow[]
}

export type TagBase = { kind: 'published' } | { kind: 'snapshot'; id: number }

export type TagVocabMutation = { op: 'upsert'; key: string; description: string | null } | { op: 'delete'; key: string }

export type CurTagMutation = {
  curId: string
  tagKey: string
  mode: CourseTagMode | 'clear'
}

export type CuTagMutation = {
  courseCode: string
  cuIds: string[]
  tagKey: string
  present: boolean
}

export type TagMutations = {
  tags: TagVocabMutation[]
  cur: CurTagMutation[]
  cu: CuTagMutation[]
}

export type CurTagPremises = {
  curId: string
  cus: { cuId: string; tagKeys: string[] }[]
  rows: Omit<CurTagRow, 'curId'>[]
  customCodeUrnKeys: string[]
}

export type TagSnapshotMeta = {
  id: number
  name: string
  description: string | null
  createdBy: string | null
  createdAt: string
  isActive: boolean
}

export type TagPayloadDiff = {
  addedTags: string[]
  removedTags: string[]
  addedCuTags: CuTagRow[]
  removedCuTags: CuTagRow[]
  addedCurTags: CurTagRow[]
  removedCurTags: CurTagRow[]
}

export type CourseUnitGroup = {
  courseCode: string
  name: LocalizedString
  cuIds: string[]
  realisationCount: number
  tagKeys: string[]
}

export type FilterSnapshotPayload = {
  appVersion?: string
  exportedAt?: string
  filters: FilterConfig[]
}

export type FilterSnapshotMeta = {
  id: number
  name: string
  description: string | null
  createdAt: string
  isActive: boolean
}

export type FilterBase = { kind: 'published' } | { kind: 'snapshot'; id: number }

export type FilterWordingField =
  | 'question'
  | 'explanation'
  | 'option'
  | 'shortName'
  | 'extraInfo'
  | 'filterExplanation'
  | 'variantShortName'
  | 'variantExtraInfo'

/**
 * Filter edits travel as an ordered list of typed ops rather than a REST call per field. Filter editing has many
 * small operations, one save batches several of them into a single transaction over the snapshot's JSONB payload,
 * and the same list also builds a version in POST /snapshots before that version exists. Keeping the ops explicit
 * leaves the door open for undo history: the list is everything needed to replay or invert an edit, which a PATCH
 * per field would not give us.
 */
export type FilterWordingMutation =
  | {
      op: 'createVariant'
      filterId: string
      variantName: string
      fromVariantName: string
      organisationCode: string | null
      lang: string | null
      primaryLanguage: string | null
      primaryLanguageSpecification: string | null
    }
  | { op: 'variantQuestion'; filterId: string; variantName: string; text: LocalizedText }
  | { op: 'variantExplanation'; filterId: string; variantName: string; text: LocalizedText | null }
  | { op: 'variantShortName'; filterId: string; variantName: string; text: LocalizedText | null }
  | { op: 'variantExtraInfo'; filterId: string; variantName: string; text: LocalizedText | null }
  | { op: 'optionName'; filterId: string; variantName: string; optionId: string; text: LocalizedText }
  | { op: 'shortName'; filterId: string; text: LocalizedText }
  | { op: 'extraInfo'; filterId: string; text: LocalizedText | null }
  | { op: 'filterExplanation'; filterId: string; text: LocalizedText | null }

export type FilterSettingsPatch = {
  enabled?: boolean
  mandatory?: boolean
  showInWelcomeModal?: boolean
  hideInCurrentFiltersDisplay?: boolean
  hideInRecommendationReasons?: boolean
  hideInFilterSidebar?: boolean
  displayType?: string | null
  parentFilterId?: string | null
  coordinateKey?: string | null
}

export type FilterOptionSettings = {
  id: string
  valueOverride: string | null
  selectedByDefault: boolean
}

export type FilterSettingsMutation =
  | { op: 'filterSettings'; filterId: string; settings: FilterSettingsPatch }
  | { op: 'filterOrder'; order: string[] }
  | {
      op: 'optionSettings'
      filterId: string
      variantName: string
      optionId: string
      settings: FilterOptionSettings
    }
  | { op: 'variantConditions'; filterId: string; variantName: string; conditions: MatchConditions }
  | { op: 'variantSkipped'; filterId: string; variantName: string; skipped: boolean }
  | { op: 'variantExtraInfoDisabled'; filterId: string; variantName: string; disabled: boolean }
  | { op: 'renameVariant'; filterId: string; variantName: string; newName: string }
  | { op: 'deleteVariant'; filterId: string; variantName: string }
  | { op: 'addOption'; filterId: string; variantName: string; optionId: string; name: LocalizedText }
  | { op: 'deleteOption'; filterId: string; variantName: string; optionId: string }

export type FilterMutations = {
  wordings: FilterWordingMutation[]
  settings: FilterSettingsMutation[]
}

export type FilterTextChange = {
  filterId: string
  variantName: string | null
  field: FilterWordingField
  optionId: string | null
  from: LocalizedText | null
  to: LocalizedText | null
}

export type FilterSettingChange = {
  filterId: string
  variantName: string | null
  optionId: string | null
  field: string
  from: string | null
  to: string | null
}

export type FilterVariantRef = { filterId: string; variantName: string }

export type FilterOptionRef = { filterId: string; variantName: string; optionId: string }

export type FilterPayloadDiff = {
  addedVariants: FilterVariantRef[]
  removedVariants: FilterVariantRef[]
  addedOptions: FilterOptionRef[]
  removedOptions: FilterOptionRef[]
  changedTexts: FilterTextChange[]
  changedSettings: FilterSettingChange[]
}
