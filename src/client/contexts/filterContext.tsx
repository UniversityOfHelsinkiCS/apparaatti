import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react'
import useQuestions, { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import { CourseData, Question, User } from '../../common/types'
import useApiMutation from '../hooks/useApiMutation'
import useApi from '../util/useApi'
import { getDefaultSelectedOptionIds } from '../util/filterDefaults'
import {
  checkChallenge,
  checkCollaboration,
  checkFinmu,
  checkFlexible,
  checkGraduation,
  checkIndependent,
  checkIntegrated,
  checkMentoring,
  checkMooc,
  checkMultiPeriod,
  checkReplacement,
  checkStudyPeriod,
  checkStudyPlace,
  checkStudyYear,
  isActiveFilterState,
} from '../util/filtering'

type LocalFilterStateKey =
  | 'replacement'
  | 'mentoring'
  | 'finmu'
  | 'challenge'
  | 'graduation'
  | 'integrated'
  | 'independent'
  | 'studyPlace'
  | 'studyYear'
  | 'studyPeriod'
  | 'mooc'
  | 'collaboration'
  | 'multiPeriod'
  | 'flexible'

/**
 * Maps filter sidebar ids to the corresponding key in FiltersGroupedType.
 * Only contains the ids handled by filterCourseDatas (local/client-side filters).
 */
const localFilterStateKeys: Record<string, LocalFilterStateKey> = {
  replacement: 'replacement',
  mentoring: 'mentoring',
  finmu: 'finmu',
  challenge: 'challenge',
  graduation: 'graduation',
  integrated: 'integrated',
  independent: 'independent',
  'study-place': 'studyPlace',
  'study-year': 'studyYear',
  'study-period': 'studyPeriod',
  mooc: 'mooc',
  collaboration: 'collaboration',
  'multi-period': 'multiPeriod',
  flexible: 'flexible',
}

interface FilterContextType {
  variantToDisplayId: string

  filters: Question[]
  user: User | null
  studyData: any
  supportedOrganisations: any
  setUserOrgCode: (s: string) => void
  courseRecommendations: CourseData[] | null
  isLoading: boolean
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  finalRecommendedCourses: CourseData[] | null

  language: string
  setLanguage: (s: string) => void
  primaryLanguage: string
  setPrimaryLanguage: (s: string) => void
  primaryLanguageSpecification: string
  setPrimaryLanguageSpecification: (s: string) => void

  studyField: string
  setStudyField: (s: string) => void
  previouslyDoneLang: string
  setPreviouslyDoneLang: (s: string) => void
  replacement: string
  setReplacement: (s: string) => void
  mentoring: string
  setMentoring: (s: string) => void
  finmu: string
  setFinmu: (s: string) => void
  challenge: string
  setChallenge: (s: string) => void
  graduation: string
  setGraduation: (s: string) => void
  studyPlace: string[]
  setStudyPlace: (s: string[]) => void
  studyYear: string
  setStudyYear: (s: string) => void
  studyPeriod: string[]
  setStudyPeriod: (s: string[]) => void
  integrated: string
  setIntegrated: (s: string) => void
  independent: string
  setIndependent: (s: string) => void
  mooc: string
  setMooc: (s: string) => void
  collaboration: string
  setCollaboration: (s: string) => void
  multiPeriod: string
  setMultiPeriod: (s: string) => void
  strictFilters: string[]
  setStrictFilters: (s: string[]) => void
  flexible: string
  setFlexible: (s: string) => void

  resetFilters: () => void
  getOptionCount: (optionId: string, filterId: string) => number | null
  filterState: FilterStateType
}

export type FilterStateType = {
  primaryLanguage: string
  setPrimaryLanguage: (s: string) => void
  language: string
  setLanguage: (s: string) => void
  primaryLanguageSpecification: string
  setPrimaryLanguageSpecification: (s: string) => void
  studyField: string
  setStudyField: (s: string) => void
  previouslyDoneLang: string
  setPreviouslyDoneLang: (s: string) => void
  replacement: string
  setReplacement: (s: string) => void
  mentoring: string
  setMentoring: (s: string) => void
  finmu: string
  setFinmu: (s: string) => void
  challenge: string
  setChallenge: (s: string) => void
  graduation: string
  setGraduation: (s: string) => void
  studyPlace: string[]
  setStudyPlace: (s: string[]) => void
  studyYear: string
  setStudyYear: (s: string) => void
  studyPeriod: string[]
  setStudyPeriod: (s: string[]) => void
  integrated: string
  setIntegrated: (s: string) => void
  independent: string
  setIndependent: (s: string) => void
  mooc: string
  setMooc: (s: string) => void
  collaboration: string
  setCollaboration: (s: string) => void
  multiPeriod: string
  setMultiPeriod: (s: string) => void
  flexible: string
  setFlexible: (s: string) => void
}

export type filterConfigMapType = {
  state: string | string[]
  setState: (state: string | string[]) => void
}

const localFilterIds = new Set([
  'primary-language-specification',
  'previusly-done-lang',
  'replacement',
  'mentoring',
  'finmu',
  'challenge',
  'graduation',
  'integrated',
  'independent',
  'study-place',
  'study-year',
  'study-period',
  'mooc',
  'collaboration',
  'multi-period',
  'flexible',
])

/**
 * Returns a helper map to easily access the state of the filters and the comparison function of the filter
 * @param filters
 * @returns
 */
export const filterConfigMap = (filters: any) =>
  new Map<string, filterConfigMapType>([
    //server side filters
    ['study-field-select', { state: filters.studyField, setState: filters.setStudyField }],
    ['primary-language', { state: filters.primaryLanguage, setState: filters.setPrimaryLanguage }],
    [
      'primary-language-specification',
      { state: filters.primaryLanguageSpecification, setState: filters.setPrimaryLanguageSpecification },
    ],
    ['lang', { state: filters.language, setState: filters.setLanguage }],

    //just a info filter
    ['previusly-done-lang', { state: filters.previouslyDoneLang, setState: filters.setPreviouslyDoneLang }],

    //local filters
    ['replacement', { state: filters.replacement, setState: filters.setReplacement }],
    ['mentoring', { state: filters.mentoring, setState: filters.setMentoring }],
    ['finmu', { state: filters.finmu, setState: filters.setFinmu }],
    ['challenge', { state: filters.challenge, setState: filters.setChallenge }],
    ['graduation', { state: filters.graduation, setState: filters.setGraduation }],
    ['integrated', { state: filters.integrated, setState: filters.setIntegrated }],
    ['independent', { state: filters.independent, setState: filters.setIndependent }],
    ['study-place', { state: filters.studyPlace, setState: filters.setStudyPlace }],
    ['study-year', { state: filters.studyYear, setState: filters.setStudyYear }],
    ['study-period', { state: filters.studyPeriod, setState: filters.setStudyPeriod }],
    ['mooc', { state: filters.mooc, setState: filters.setMooc }],
    ['collaboration', { state: filters.collaboration, setState: filters.setCollaboration }],
    ['multi-period', { state: filters.multiPeriod, setState: filters.setMultiPeriod }],
    ['flexible', { state: filters.flexible, setState: filters.setFlexible }],
  ])

const runFilter = (
  result: CourseData[],
  value: string | string[],
  check: (c: CourseData, value: any) => boolean
): CourseData[] => {
  if (isActiveFilterState(value)) {
    return result.filter(c => check(c, value))
  }
  return result
}

/**
 * @param courseData
 * applies local filters to courseData according to the choices
 *
 *
 * @param filters
 */

export const filterCourseDatas = (courseData: CourseData[], filters: FilterStateType) => {
  let result: CourseData[] = Array.from(courseData)

  result = runFilter(result, filters.replacement, checkReplacement)
  result = runFilter(result, filters.mentoring, checkMentoring)
  result = runFilter(result, filters.finmu, checkFinmu)
  result = runFilter(result, filters.challenge, checkChallenge)
  result = runFilter(result, filters.graduation, checkGraduation)
  result = runFilter(result, filters.integrated, checkIntegrated)
  result = runFilter(result, filters.independent, checkIndependent)
  result = runFilter(result, filters.studyPlace, checkStudyPlace)
  result = runFilter(result, filters.studyYear, checkStudyYear)
  result = runFilter(result, filters.studyPeriod, checkStudyPeriod)
  result = runFilter(result, filters.mooc, checkMooc)
  result = runFilter(result, filters.collaboration, checkCollaboration)
  result = runFilter(result, filters.multiPeriod, checkMultiPeriod)
  result = runFilter(result, filters.flexible, checkFlexible)

  return result
}

export const isFilterStateAnswered = (state: unknown): boolean => {
  if (Array.isArray(state)) {
    return state.length > 0
  }

  if (typeof state === 'string') {
    return state !== ''
  }

  return Boolean(state)
}

export const shouldRenderWelcomeFilter = (
  filterId: string,
  variant: { skipped?: boolean } | null,
  language: string,
  primaryLanguage: string
): boolean => {
  if (!variant || variant.skipped) {
    return false
  }

  if (filterId === 'primary-language-specification') {
    return language !== '' && language !== 'en' && language === primaryLanguage
  }

  return true
}

/**
 * @returns
 * Mandatory filters that are being displayed in the app,
 * taking into account the cases where the user searches for main language courses
 */
export const getUnansweredCurrentMandatoryFilters = (filters: Question[], filterContext: FilterContextType) => {
  const configMap = filterConfigMap(filterContext)
  const { variantToDisplayId, language, primaryLanguage } = filterContext

  return filters.filter(filter => {
    if (!filter.mandatory) {
      return false
    }

    const variant = pickVariant(filter, variantToDisplayId) ?? null
    if (!shouldRenderWelcomeFilter(filter.id, variant, language, primaryLanguage)) {
      return false
    }

    const config = configMap.get(filter.id)
    if (!config) {
      return false
    }

    return !isFilterStateAnswered(config.state)
  })
}

export const shouldShowFilterInSidebar = (filter: Pick<Question, 'id' | 'showInWelcomeModal'>) => {
  return !filter.showInWelcomeModal || filter.id === 'primary-language-specification'
}

export const getCoordinateDisplayName = (coordinateKey: string, filterContext: any): string => {
  const question = filterContext.filters.find((q: any) => q.coordinateKey === coordinateKey)
  return question?.shortName ?? coordinateKey
}

export const getFilterVariant = (filterContext: FilterContextType, filterId: string) => {
  const question = filterContext.filters.find((q: any) => q.id === filterId)
  const variantId = updateVariantToDisplayId(
    filterContext.language,
    filterContext.primaryLanguage,
    filterContext.primaryLanguageSpecification
  )

  const variant = question != undefined ? pickVariant(question, variantId) : null
  if (variant) {
    return variant
  } else {
    return null
  }
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const FilterContextProvider = ({ children }: { children: ReactNode }) => {
  const [primaryLanguage, setPrimaryLanguage] = useState('')
  const [primaryLanguageSpecification, setPrimaryLanguageSpecification] = useState('')
  const [language, setLanguage] = useState('')
  const [studyField, setStudyField] = useState('')
  const [userOrgCode, setUserOrgCode] = useState('')
  const [courseRecommendations, setCourseRecommendations] = useState<CourseData[] | null>(null)
  const [finalRecommendedCourses, setFinalRecommendedCourses] = useState<CourseData[] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const shouldUsePrimaryLanguageSpecification = language !== '' && language !== 'en' && language === primaryLanguage

  const variantToDisplayId = updateVariantToDisplayId(language, primaryLanguage, primaryLanguageSpecification)

  const [previouslyDoneLang, setPreviouslyDoneLang] = useState('')
  const [replacement, setReplacement] = useState('')
  const [mentoring, setMentoring] = useState('')
  const [finmu, setFinmu] = useState('')
  const [challenge, setChallenge] = useState('')
  const [graduation, setGraduation] = useState('')
  const [studyPlace, setStudyPlace] = useState<string[]>([])
  const [studyYear, setStudyYear] = useState('2025')
  const [studyPeriod, setStudyPeriod] = useState<string[]>([])
  const [integrated, setIntegrated] = useState('')
  const [independent, setIndependent] = useState('')
  const [mooc, setMooc] = useState('')
  const [collaboration, setCollaboration] = useState('')
  const [multiPeriod, setMultiPeriod] = useState('')
  const [flexible, setFlexible] = useState('')
  const [strictFilters, setStrictFilters] = useState<string[]>([])
  const [strictFiltersInitialized, setStrictFiltersInitialized] = useState(false)
  const [multichoiceDefaultsInitialized, setMultichoiceDefaultsInitialized] = useState(false)
  const { filters, isLoading: filtersLoading } = useQuestions()

  const strictByDefaultFilterIds = filters.filter(f => f.isStrictByDefault === true).map(f => f.id)

  useEffect(() => {
    if (!filtersLoading && filters.length > 0 && !strictFiltersInitialized) {
      setStrictFilters(strictByDefaultFilterIds)
      setStrictFiltersInitialized(true)
    }
  }, [filters, filtersLoading, strictFiltersInitialized, strictByDefaultFilterIds])

  const getDefaultMultichoiceState = useCallback(
    (filterId: string) =>
      getDefaultSelectedOptionIds(
        filters.find(filter => filter.id === filterId),
        'default'
      ),
    [filters]
  )

  useEffect(() => {
    if (!filtersLoading && filters.length > 0 && !multichoiceDefaultsInitialized) {
      setStudyPlace(getDefaultMultichoiceState('study-place'))
      setStudyPeriod(getDefaultMultichoiceState('study-period'))
      setMultichoiceDefaultsInitialized(true)
    }
  }, [filters, filtersLoading, multichoiceDefaultsInitialized, getDefaultMultichoiceState])

  useEffect(() => {
    if (!shouldUsePrimaryLanguageSpecification && primaryLanguageSpecification !== '') {
      setPrimaryLanguageSpecification('')
    }
  }, [shouldUsePrimaryLanguageSpecification, primaryLanguageSpecification])

  const filterState: FilterStateType = {
    studyField,
    setStudyField,
    primaryLanguage,
    setPrimaryLanguage,
    language,
    setLanguage,
    primaryLanguageSpecification,
    setPrimaryLanguageSpecification,
    previouslyDoneLang,
    setPreviouslyDoneLang,
    replacement,
    setReplacement,
    mentoring,
    setMentoring,
    finmu,
    setFinmu,
    challenge,
    setChallenge,
    graduation,
    setGraduation,
    studyPlace,
    setStudyPlace,
    studyYear,
    setStudyYear,
    studyPeriod,
    setStudyPeriod,
    integrated,
    setIntegrated,
    independent,
    setIndependent,
    mooc,
    setMooc,
    collaboration,
    setCollaboration,
    multiPeriod,
    setMultiPeriod,
    flexible,
    setFlexible,
  }

  /**
   * Precomputed map of `${filterId}:${optionId}` → course count that would be
   * visible if that option were selected (given all other active filters).
   * Only populated for local (client-side) filter ids.
   */
  const optionCountMap = useMemo(() => {
    const map = new Map<string, number>()

    for (const question of filters) {
      const stateKey = localFilterStateKeys[question.id]
      if (!stateKey) continue

      const variant = pickVariant(question, variantToDisplayId)
      if (!variant || variant.skipped || !variant.options) continue

      for (const option of variant.options) {
        let hypotheticalValue: string | string[]

        if (question.displayType === 'multichoice') {
          // Show how many courses match this option alone (with all other filters active)
          hypotheticalValue = [option.id]
        } else {
          // singlechoice and dropdownselect: replace
          hypotheticalValue = option.id
        }

        const hypotheticalState = { ...filterState, [stateKey]: hypotheticalValue }
        const count = filterCourseDatas(courseRecommendations ?? [], hypotheticalState).length
        map.set(`${question.id}:${option.id}`, count)
      }
    }

    return map
  }, [
    courseRecommendations,
    filters,
    variantToDisplayId,
    replacement,
    mentoring,
    finmu,
    challenge,
    graduation,
    studyPlace,
    studyYear,
    studyPeriod,
    integrated,
    independent,
    mooc,
    collaboration,
    multiPeriod,
    flexible,
  ])

  const getOptionCount = (filterId: string, optionId: string): number | null => {
    if (!(filterId in localFilterStateKeys)) return null
    return optionCountMap.get(`${filterId}:${optionId}`) ?? null
  }

  const checkWelcomeQuestionsAnswered = () => {
    const configMap = filterConfigMap(filterState)

    const welcomeQuestions = filters.filter(q => q.showInWelcomeModal)
    return welcomeQuestions.every(question => {
      const config = configMap.get(question.id)
      if (!config) return true
      if (!question.mandatory) return true

      const variant = pickVariant(question, variantToDisplayId) ?? null
      if (!shouldRenderWelcomeFilter(question.id, variant, language, primaryLanguage)) return true

      return isFilterStateAnswered(config.state)
    })
  }

  useEffect(() => {
    if (filtersLoading) {
      return
    }

    const hasVisited = sessionStorage.getItem('hasVisitedV2')
    if (!hasVisited || !checkWelcomeQuestionsAnswered()) {
      setModalOpen(true)
      sessionStorage.setItem('hasVisitedV2', 'true')
    }
  }, [
    filtersLoading,
    filters,
    studyField,
    primaryLanguage,
    language,
    primaryLanguageSpecification,
    replacement,
    mentoring,
    variantToDisplayId,
  ])

  const resetFilters = () => {
    const sidebarFilterIds = new Set(
      filters.filter(filter => shouldShowFilterInSidebar(filter)).map(filter => filter.id)
    )
    const configMap = filterConfigMap(filterState)

    sidebarFilterIds.forEach(filterId => {
      const config = configMap.get(filterId)
      if (!config) {
        return
      }

      if (filterId === 'study-place' || filterId === 'study-period') {
        config.setState(getDefaultMultichoiceState(filterId))
        return
      }

      if (filterId === 'study-year') {
        config.setState('2025')
        return
      }

      config.setState('')
    })

    setUserOrgCode(studyField)

    const preservedWelcomeStrictFilters = strictFilters.filter(filterId => !sidebarFilterIds.has(filterId))
    const resetNonWelcomeStrictFilters = strictByDefaultFilterIds.filter(filterId => sidebarFilterIds.has(filterId))

    setStrictFilters([...new Set([...preservedWelcomeStrictFilters, ...resetNonWelcomeStrictFilters])])
  }

  const { data: user, isLoading: userLoading } = useApi<User>('user', '/api/user', 'GET')
  const { data: studyData, isLoading: studyDataLoading } = useApi('studyData', '/api/user/studydata', 'GET')
  const { data: supportedOrganisations, isLoading: supportedOrganisationsLoading } = useApi(
    'supportedOrganisations',
    '/api/organisations/supported',
    'GET'
  )

  const isLoading = userLoading || studyDataLoading || supportedOrganisationsLoading || filtersLoading

  const submitAnswerMutation = useApiMutation(async (res: Response) => {
    const recommendations = await res.json()
    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    const dateFormatted: CourseData[] = recommendations.map((c: any) => {
      return {
        ...c,
        startDate: new Date(c.startDate),
        endDate: new Date(c.endDate),
      }
    })

    setCourseRecommendations(dateFormatted)
  }, '/api/form/coursedata')

  useEffect(() => {
    setFinalRecommendedCourses(courseRecommendations)
  }, [courseRecommendations])

  const getTrueFilterValue = (filterOptionId: string, questionId: string) => {
    const filter = filters.find(f => f.id === questionId)
    if (!filter || !filter.variants) {
      return filterOptionId
    }

    const variant = pickVariant(filter, variantToDisplayId)
    if (!variant || !variant.options) {
      return filterOptionId
    }
    const option = variant?.options.find(o => o.id === filterOptionId)
    if (option?.valueOverride != undefined) {
      return option.valueOverride
    } else {
      return filterOptionId
    }
  }
  const submitFilters = () => {
    const answerDataRaw = {
      'study-field-select': getTrueFilterValue(userOrgCode, 'study-field-select'),
      'primary-language': getTrueFilterValue(primaryLanguage, 'primary-language'),
      lang: getTrueFilterValue(language, 'lang'),
      'primary-language-specification': shouldUsePrimaryLanguageSpecification
        ? getTrueFilterValue(primaryLanguageSpecification, 'primary-language-specification')
        : '',
    }

    const answerData = Object.fromEntries(
      Object.entries(answerDataRaw).filter(([, value]) => {
        if (typeof value === 'string') {
          return value !== ''
        }
        return true
      })
    )

    const payload = {
      answerData,
      strictFields: strictFilters,
    }

    submitAnswerMutation.mutateAsync(payload, undefined)
  }

  useEffect(() => {
    submitFilters()
  }, [userOrgCode, primaryLanguage, language, primaryLanguageSpecification])

  useEffect(() => {
    const filtered = filterCourseDatas(courseRecommendations ?? [], filterState)

    setFinalRecommendedCourses(filtered)
  }, [
    previouslyDoneLang,
    replacement,
    mentoring,
    finmu,
    challenge,
    graduation,
    studyPlace,
    studyYear,
    studyPeriod,
    integrated,
    independent,
    mooc,
    collaboration,
    multiPeriod,
    flexible,
    strictFilters,
    courseRecommendations,
  ])

  return (
    <FilterContext.Provider
      value={{
        variantToDisplayId,
        language,
        setLanguage,

        primaryLanguage,
        setPrimaryLanguage,

        primaryLanguageSpecification,
        setPrimaryLanguageSpecification,

        filters,
        user,
        studyData,
        supportedOrganisations,
        setUserOrgCode,
        courseRecommendations,
        isLoading,
        modalOpen,
        setModalOpen,
        finalRecommendedCourses,

        studyField,
        setStudyField,
        previouslyDoneLang,
        setPreviouslyDoneLang,
        replacement,
        setReplacement,
        mentoring,
        setMentoring,
        finmu,
        setFinmu,
        challenge,
        setChallenge,
        graduation,
        setGraduation,
        studyPlace,
        setStudyPlace,
        studyYear,
        setStudyYear,
        studyPeriod,
        setStudyPeriod,
        integrated,
        setIntegrated,
        independent,
        setIndependent,
        mooc,
        setMooc,
        collaboration,
        setCollaboration,
        multiPeriod,
        setMultiPeriod,
        flexible,
        setFlexible,
        strictFilters,
        setStrictFilters,
        resetFilters,
        getOptionCount,
        filterState,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export const useFilterContext = (): FilterContextType => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterContextProvider')
  }
  return context
}
