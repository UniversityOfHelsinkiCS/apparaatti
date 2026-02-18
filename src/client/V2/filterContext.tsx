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
}

export const filterConfigMap = (filters: any) => new Map([
  ['study-field-select', {
    state: filters.studyField,
    setState: filters.setStudyField,
    displayType: 'dropdownselect',
    superToggle: false, 
    hideInCurrentFiltersDisplay: true,
    hideInRecommendationReasons: true
  }],
  ['primary-language', {
    state: filters.primaryLanguage,
    setState: filters.setPrimaryLanguage,
    hideInCurrentFiltersDisplay: false,
    hideInRecommendationReasons: true
  }],
  ['lang', {
    state: filters.language,
    setState: filters.setLanguage,
    hideInRecommendationReasons: true
  }],
  ['primary-language-specification', {
    state: filters.primaryLanguageSpecification,
    setState: filters.setPrimaryLanguageSpecification,
    hideInRecommendationReasons: true
  }],
  ['previusly-done-lang', {
    state: filters.previouslyDoneLang,
    setState: filters.setPreviouslyDoneLang,
    superToggle: false,
    hideInCurrentFiltersDisplay: true,
    hideInRecommendationReasons: true
  }],
  ['replacement', {
    state: filters.replacement,
    setState: filters.setReplacement,
    superToggle: false
  }],
  ['mentoring', {
    state: filters.mentoring,
    setState: filters.setMentoring,
    superToggle: false
  }],
  ['finmu', {
    state: filters.finmu,
    setState: filters.setFinmu,
    superToggle: false
  }],
  ['challenge', {
    state: filters.challenge,
    setState: filters.setChallenge,
    superToggle: false
  }],
  ['graduation', {
    state: filters.graduation,
    setState: filters.setGraduation,
    superToggle: false
  }],
  ['integrated', {
    state: filters.integrated,
    setState: filters.setIntegrated,
    superToggle: false
  }],
  ['independent', {
    state: filters.independent,
    setState: filters.setIndependent,
    superToggle: false
  }],
  ['study-place', {
    state: filters.studyPlace,
    setState: filters.setStudyPlace,
    displayType: 'multichoice',
    superToggle: true
  }],
  ['study-year', {
    state: filters.studyYear,
    setState: filters.setStudyYear,
    displayType: 'singlechoice',
    superToggle: false,
    hideInCurrentFiltersDisplay: true,
    hideInFilterSideBar: true
  }],
  ['study-period', {
    state: filters.studyPeriod,
    setState: filters.setStudyPeriod,
    displayType: 'multichoice',
    superToggle: false
  }],
  ['mooc', {
    state: filters.mooc,
    setState: filters.setMooc,
    superToggle: false
  }],
  ['collaboration', {
    state: filters.collaboration,
    setState: filters.setCollaboration,
    superToggle: false
  }],
  ['multi-period', {
    state: filters.multiPeriod,
    setState: filters.setMultiPeriod,
    superToggle: false
  }],
])

// Map coordinate keys to filter IDs for recommendation reasons
export const coordinateKeyToFilterId: { [key: string]: string } = {
  date: 'study-period',
  org: 'study-field-select',
  lang: 'lang',
  graduation: 'graduation',
  mentoring: 'mentoring',
  integrated: 'integrated',
  studyPlace: 'study-place',
  replacement: 'replacement',
  challenge: 'challenge',
  independent: 'independent',
  flexible: 'flexible',
  mooc: 'mooc',
  finmu: 'finmu',
  collaboration: 'collaboration',
  multiPeriod: 'multi-period',
}

// Get translated short name for a coordinate key
export const getCoordinateDisplayName = (coordinateKey: string, filterContext: any, t: (key: string) => string): string => {
  const filterId = coordinateKeyToFilterId[coordinateKey]
  if (!filterId) return coordinateKey
  
  const question = filterContext.filters.find((q: any) => q.id === filterId)
  
  if (!question?.shortName) return coordinateKey
  
  return question.shortName
}


export const getFilterVariant = (filterContext, filterId) => {
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

  const variantToDisplayId = updateVariantToDisplayId(language, primaryLanguage, primaryLanguageSpecification)

  const checkWelcomeQuestionsAnswered = () => {
    const shouldShowSpecification = language === primaryLanguage
    return (
      studyField !== '' &&
      primaryLanguage !== '' &&
      language !== '' &&
      (shouldShowSpecification ? primaryLanguageSpecification !== '' : true)
    )
  }

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedV2')
    if (!hasVisited || !checkWelcomeQuestionsAnswered()) {
      setModalOpen(true)
      sessionStorage.setItem('hasVisitedV2', 'true')
    }
  }, [studyField, primaryLanguage, language, primaryLanguageSpecification])


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
  const [strictFilters, setStrictFilters] = useState<string[]>(['collaboration'])


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

  const isLoading = userLoading || studyDataLoading || supportedOrganisationsLoading

  const allFilters = useQuestions()
  const filters = allFilters

  const submitAnswerMutation = useApiMutation(async (res) => {
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
    const filter = allFilters.find(f => f.id === questionId)
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
      'primary-language-specification': getTrueFilterValue(primaryLanguageSpecification, 'primary-language-specification'),
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

    submitAnswerMutation.mutateAsync(payload)
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
        strictFilters,
        setStrictFilters,
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
