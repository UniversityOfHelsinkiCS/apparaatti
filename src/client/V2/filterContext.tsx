import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import useQuestions from '../hooks/useQuestions'
import { CourseRecommendations, Question, User } from '../../common/types'
import useApiMutation from '../hooks/useApiMutation'

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
  integrated: string
  setIntegrated: (s: string) => void
  independent: string
  setIndependent: (s: string) => void
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

  // Filter values
  const [studyField, setStudyField] = useState('')
  const [previouslyDoneLang, setPreviouslyDoneLang] = useState('')
  const [replacement, setReplacement] = useState('')
  const [mentoring, setMentoring] = useState('')
  const [finmu, setFinmu] = useState('')
  const [challenge, setChallenge] = useState('')
  const [graduation, setGraduation] = useState('')
  const [studyPlace, setStudyPlace] = useState<string[]>([])
  const [integrated, setIntegrated] = useState('')
  const [independent, setIndependent] = useState('')

  // These are placeholders, in a real app you would fetch this data
  const [user] = useState<User | null>(null)
  const [studyData] = useState(null)
  const [supportedOrganisations] = useState(null)

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
    const answerData = {
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
      integrated,
      independent,
    }

    const payload = {
      answerData,
      strictFields: [], // V2 does not have strict fields for now
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
    integrated,
    independent,
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
        integrated,
        setIntegrated,
        independent,
        setIndependent,
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
