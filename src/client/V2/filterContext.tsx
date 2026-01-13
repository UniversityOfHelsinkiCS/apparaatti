import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import useQuestions, { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import { CourseRecommendations, Question, User } from '../../common/types'
import useApiMutation from '../hooks/useApiMutation'
import useApi from '../util/useApi'

interface FilterContextType {
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

  // Filter values
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
    hideInCurrentFiltersDisplay: true
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
    setState: filters.setPreviouslyDoneLang
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
  ['study-period', {
    shortName: 'Periodi',
    state: filters.studyPeriod,
    setState: filters.setStudyPeriod,
    displayType: 'multichoice',
    superToggle: false // Corresponds to 'date' which is always false
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
  const [variantToDisplayId, setVariantToDisplayId] = useState('default')
  const [userOrgCode, setUserOrgCode] = useState('')
  const [courseRecommendations, setCourseRecommendations] =
    useState<CourseRecommendations | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedV2')
    if (!hasVisited) {
      setModalOpen(true)
      sessionStorage.setItem('hasVisitedV2', 'true')
    }
  }, [])

  // Filter values
  const [studyField, setStudyField] = useState('')
  const [previouslyDoneLang, setPreviouslyDoneLang] = useState('')
  const [replacement, setReplacement] = useState('')
  const [mentoring, setMentoring] = useState('')
  const [finmu, setFinmu] = useState('')
  const [challenge, setChallenge] = useState('')
  const [graduation, setGraduation] = useState('')
  const [studyPlace, setStudyPlace] = useState<string[]>([])
  const [studyPeriod, setStudyPeriod] = useState<string[]>([])
  const [integrated, setIntegrated] = useState('')
  const [independent, setIndependent] = useState('')
  const [mooc, setMooc] = useState('')
  const [strictFilters, setStrictFilters] = useState<string[]>([])

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

  const submitFilters = () => {
    const answerDataRaw = {
      'study-field-select': userOrgCode,
      'primary-language': primaryLanguage,
      lang: language,
      'primary-language-specification': primaryLanguageSpecification,
      'previusly-done-lang': previouslyDoneLang,
      replacement,
      mentoring,
      finmu,
      challenge,
      graduation,
      'study-place': studyPlace,
      'study-period': studyPeriod,
      integrated,
      independent,
      mooc,
    }

    // Filter out empty strings
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
    studyPeriod,
    integrated,
    independent,
    mooc,
    strictFilters,
  ])

  return (
    <FilterContext.Provider
      value={{
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

        // Filter values
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
