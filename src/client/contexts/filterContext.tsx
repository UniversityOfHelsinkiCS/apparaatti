import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import useQuestions, { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import { CourseRecommendations, Question, User } from '../../common/types'
import useApiMutation from '../hooks/useApiMutation'
import useApi from '../util/useApi'

interface UIVariantType{
  name: string,
  value: string
}

interface FilterContextType {
  uiVariant: UIVariantType[]
  setUiVariant: (u: UIVariantType[]) => void

  language: string
  setLanguage: (s: string) => void

  primaryLanguage: string
  setPrimaryLanguage: (s: string) => void

  primaryLanguageSpecification: string
  setPrimaryLanguageSpecification: (s: string) => void

  variantToDisplayId: string

  filters: Question[]
  user: User | null
  studyData: any
  supportedOrganisations: any
  setUserOrgCode: (s: string) => void
  courseRecommendations: CourseRecommendations | null
  isLoading: boolean
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  finalRecommendedCourses: CourseRecommendations | null


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
  exam: string
  setExam: (s: string) => void
  flexible: string
  setFlexible: (s: string) => void
  resetFilters: () => void
}

export const filterConfigMap = (filters: any) => new Map([
  ['study-field-select', { state: filters.studyField, setState: filters.setStudyField }],
  ['primary-language', { state: filters.primaryLanguage, setState: filters.setPrimaryLanguage }],
  ['lang', { state: filters.language, setState: filters.setLanguage }],
  ['primary-language-specification', { state: filters.primaryLanguageSpecification, setState: filters.setPrimaryLanguageSpecification }],
  ['previusly-done-lang', { state: filters.previouslyDoneLang, setState: filters.setPreviouslyDoneLang }],
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
  ['exam', { state: filters.exam, setState: filters.setExam }],
  ['flexible', { state: filters.flexible, setState: filters.setFlexible }],
])

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

export const getCoordinateDisplayName = (coordinateKey: string, filterContext: any): string => {
  const question = filterContext.filters.find((q: any) => q.coordinateKey === coordinateKey)
  return question?.shortName ?? coordinateKey
}


export const getFilterVariant = (filterContext: FilterContextType, filterId: string) => {
  const question = filterContext.filters.find((q: any) => q.id === filterId)
  const variantId = updateVariantToDisplayId(filterContext.language, filterContext.primaryLanguage, filterContext.primaryLanguageSpecification)

  const variant = question != undefined ? pickVariant(question, variantId) : null
  if(variant){
    return variant
  }
  else{
    return null
  }
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const FilterContextProvider = ({ children }: { children: ReactNode }) => {
  const [primaryLanguage, setPrimaryLanguage] = useState('')
  const [primaryLanguageSpecification, setPrimaryLanguageSpecification] =
    useState('')
  const [language, setLanguage] = useState('')
  const [studyField, setStudyField] = useState('')
  const [userOrgCode, setUserOrgCode] = useState('')
  const [courseRecommendations, setCourseRecommendations] =
    useState<CourseRecommendations | null>(null)
  const [finalRecommendedCourses, setFinalRecommendedCourses] =
    useState<CourseRecommendations | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const shouldUsePrimaryLanguageSpecification =
    language !== '' && language !== 'en' && language === primaryLanguage

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
  const [exam, setExam] = useState('0')
  const [flexible, setFlexible] = useState('')
  const [strictFilters, setStrictFilters] = useState<string[]>([])
  const [strictFiltersInitialized, setStrictFiltersInitialized] = useState(false)
  const { filters, isLoading: filtersLoading } = useQuestions()

  useEffect(() => {
    if (!filtersLoading && filters.length > 0 && !strictFiltersInitialized) {
      setStrictFilters(filters.filter((f) => f.isStrictByDefault).map((f) => f.id))
      setStrictFiltersInitialized(true)
    }
  }, [filters, filtersLoading, strictFiltersInitialized])

  useEffect(() => {
    if (!shouldUsePrimaryLanguageSpecification && primaryLanguageSpecification !== '') {
      setPrimaryLanguageSpecification('')
    }
  }, [
    shouldUsePrimaryLanguageSpecification,
    primaryLanguageSpecification,
  ])

  const checkWelcomeQuestionsAnswered = () => {
    const configMap = filterConfigMap({
      studyField, setStudyField,
      primaryLanguage, setPrimaryLanguage,
      language, setLanguage,
      primaryLanguageSpecification, setPrimaryLanguageSpecification,
      replacement, setReplacement,
      mentoring, setMentoring,
    })

    const welcomeQuestions = filters.filter((q) => q.showInWelcomeModal)
    return welcomeQuestions.every((question) => {
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
    setPreviouslyDoneLang('')
    setReplacement('')
    setMentoring('')
    setFinmu('')
    setChallenge('')
    setGraduation('')
    setStudyPlace([])
    setStudyPeriod([])
    setIntegrated('')
    setIndependent('')
    setMooc('')
    setFlexible('')
    setStrictFilters(filters.filter((f) => f.isStrictByDefault).map((f) => f.id))
  }


  const [uiVariant, setUiVariant] = useState([
    {name: 'recommendation-reasons-style', value: 'question-icon'},
    {name: 'recommendation-reasons-incorrect-hidden', value: 'false'}
  ]) 

  const { data: user, isLoading: userLoading } = useApi(
    'user',
    '/api/user',
    'GET',
    undefined
  )
  const { data: studyData, isLoading: studyDataLoading } = useApi(
    'studyData',
    '/api/user/studydata',
    'GET',
    undefined
  )
  const {
    data: supportedOrganisations,
    isLoading: supportedOrganisationsLoading,
  } = useApi(
    'supportedOrganisations',
    '/api/organisations/supported',
    'GET',
    undefined
  )

  const isLoading = userLoading || studyDataLoading || supportedOrganisationsLoading || filtersLoading

  const submitAnswerMutation = useApiMutation(async (res: Response) => {
    const recommendations = await res.json()
    setCourseRecommendations(recommendations)
    if (!res.ok) {
      throw new Error('Network response was not ok')
    }
  }, '/api/form/answer')

  useEffect(() => {
    setFinalRecommendedCourses(courseRecommendations)
  }, [courseRecommendations])

  const getTrueFilterValue = (filterOptionId: string, questionId: string) => {
    const filter = filters.find(f => f.id === questionId)
    if(!filter || !filter.variants){
      return filterOptionId
    }

    const variant = pickVariant(filter, variantToDisplayId)  
    if(!variant || !variant.options){
      return filterOptionId
    }
    const option = variant?.options.find(o => o.id === filterOptionId)
    if(option?.valueOverride != undefined){
      return option.valueOverride
    }
    else{
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
      'previusly-done-lang': getTrueFilterValue(previouslyDoneLang, 'previusly-done-lang'),
      'replacement': getTrueFilterValue(replacement, 'replacement'),
      'mentoring': getTrueFilterValue(mentoring, 'mentoring'),
      'finmu': getTrueFilterValue(finmu, 'finmu'),
      'challenge': getTrueFilterValue(challenge, 'challenge'),
      'graduation': getTrueFilterValue(graduation, 'graduation'),
      'study-place': studyPlace,
      'study-period': studyPeriod.length > 0 ? studyPeriod : ['neutral'],
      'study-year': getTrueFilterValue(studyYear, 'study-year'),
      'integrated': getTrueFilterValue(integrated, 'integrated'),
      'independent': getTrueFilterValue(independent, 'independent'),
      'mooc': getTrueFilterValue(mooc, 'mooc'),
      'collaboration': getTrueFilterValue(collaboration, 'collaboration'),
      'multi-period': getTrueFilterValue(multiPeriod, 'multi-period'),
      'exam': getTrueFilterValue(exam, 'exam'),
      'flexible': getTrueFilterValue(flexible, 'flexible'),
    }

    const answerData = Object.fromEntries(
      Object.entries(answerDataRaw).filter(([, value]) => {
        if (typeof value === 'string') {
          return value !== ''
        }
        if (Array.isArray(value)) {
          return value.length > 0
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
  }, [
    userOrgCode,
    primaryLanguage,
    language,
    primaryLanguageSpecification,
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
    exam,
    flexible,
    strictFilters,
  ])

  return (
    <FilterContext.Provider
      value={{
        uiVariant,
        setUiVariant,
        
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
        exam,
        setExam,
        flexible,
        setFlexible,
        strictFilters,
        setStrictFilters,
        resetFilters,
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
