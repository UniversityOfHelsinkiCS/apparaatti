import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import useQuestions, { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import { CourseRecommendations, Question, User } from '../../common/types'
import useApiMutation from '../hooks/useApiMutation'
import useApi from '../util/useApi'
import SuperToggle from './components/SuperToggle'

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
  setVariantToDisplayId: (s: string) => void

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
  strictFilters: string[]
  setStrictFilters: (s: string[]) => void
}

export const filterConfigMap = (filters: any) => new Map([
  ['study-field-select', {
    shortName: 'Opinto-oikeus',
    state: filters.studyField,
    setState: filters.setStudyField,
    displayType: 'dropdownselect',
    superToggle: false, 
    hideInCurrentFiltersDisplay: true
  }],
  ['primary-language', {
    shortName: 'Koulukieli',
    state: filters.primaryLanguage,
    setState: filters.setPrimaryLanguage,
    hideInCurrentFiltersDisplay: false
  }],
  ['lang', {
    shortName: 'Kurssi',
    state: filters.language,
    setState: filters.setLanguage
  }],
  ['primary-language-specification', {
    shortName: 'Viestintä',
    state: filters.primaryLanguageSpecification,
    setState: filters.setPrimaryLanguageSpecification
  }],
  ['previusly-done-lang', {
    shortName: 'Aikaisemmat opinnot',
    state: filters.previouslyDoneLang,
    setState: filters.setPreviouslyDoneLang,
    superToggle: false,
    hideInCurrentFiltersDisplay: true
  }],
  ['replacement', {
    shortName: 'Korvaava',
    state: filters.replacement,
    setState: filters.setReplacement,
    superToggle: true
  }],
  ['mentoring', {
    shortName: 'Valmentava',
    state: filters.mentoring,
    setState: filters.setMentoring,
    superToggle: true
  }],
  ['finmu', {
    shortName: 'Finmu',
    state: filters.finmu,
    setState: filters.setFinmu,
    superToggle: true
  }],
  ['challenge', {
    shortName: 'Edistynyt',
    state: filters.challenge,
    setState: filters.setChallenge,
    superToggle: true
  }],
  ['graduation', {
    shortName: 'Valmistuville',
    state: filters.graduation,
    setState: filters.setGraduation,
    superToggle: true
  }],
  ['integrated', {
    shortName: 'Integroitu',
    state: filters.integrated,
    setState: filters.setIntegrated,
    superToggle: true
  }],
  ['independent', {
    shortName: 'Itsenäinen',
    state: filters.independent,
    setState: filters.setIndependent,
    superToggle: true
  }],
  ['study-place', {
    shortName: 'Opetusmuoto',
    state: filters.studyPlace,
    setState: filters.setStudyPlace,
    displayType: 'multichoice',
    superToggle: true
  }],
  ['study-year', {
    shortName: 'Lukuvuosi',
    state: filters.studyYear,
    setState: filters.setStudyYear,
    displayType: 'singlechoice',
    superToggle: false,
    hideInCurrentFiltersDisplay: true,
    hideInFilterSideBar: true
  }],
  ['study-period', {
    shortName: 'Periodi',
    state: filters.studyPeriod,
    setState: filters.setStudyPeriod,
    displayType: 'multichoice',
    superToggle: false
  }],
  ['mooc', {
    shortName: 'MOOC',
    state: filters.mooc,
    setState: filters.setMooc,
    superToggle: true
  }],
])


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
  const [variantToDisplayId, setVariantToDisplayId] = useState('default')
  const [userOrgCode, setUserOrgCode] = useState('')
  const [courseRecommendations, setCourseRecommendations] =
    useState<CourseRecommendations | null>(null)
  const [finalRecommendedCourses, setFinalRecommendedCourses] =
    useState<CourseRecommendations | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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
  const [strictFilters, setStrictFilters] = useState<string[]>([])


  const [uiVariant, setUiVariant] = useState([
    {name: 'recommendation-reasons-style', value: 'question-icon'}]
  ) 

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
    const variant = filter?.variants.find(v => v.name === variantToDisplayId)
    const option = variant?.options.find(o => o.id === filterOptionId)
    if(option?.valueOverride){
      console.log('returning overriden value')
      console.log(variant)
      console.log(option)
      return option.valueOverride
    }
    else{
      return filterOptionId
    }
    
  }
  const submitFilters = () => {
    const answerDataRaw = {
      'study-field-select': userOrgCode,
      'primary-language': primaryLanguage,
      lang: language,
      'primary-language-specification': primaryLanguageSpecification,
      'previusly-done-lang': previouslyDoneLang,
      'replacement': getTrueFilterValue(replacement, 'replacement'),
      mentoring,
      finmu,
      challenge,
      graduation,
      'study-place': studyPlace,
      'study-period': studyPeriod.length > 0 ? studyPeriod : ['neutral'],
      'study-year': studyYear,
      integrated,
      independent,
      mooc,
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

    console.log('answerData', answerData)

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
    strictFilters,
  ])

  return (
    <FilterContext.Provider
      value={{
        uiVariant,
        setUiVariant,
        
        language,
        setLanguage,

        primaryLanguage,
        setPrimaryLanguage,

        primaryLanguageSpecification,
        setPrimaryLanguageSpecification,

        variantToDisplayId,
        setVariantToDisplayId,

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
