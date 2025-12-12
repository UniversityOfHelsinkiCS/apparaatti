import { createContext, useContext, useState, ReactNode } from 'react'
import useQuestions from '../hooks/useQuestions'
import { Question, User } from '../../common/types'

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
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const FilterContextProvider = ({ children }: { children: ReactNode }) => {
  const [primaryLanguage, setPrimaryLanguage] = useState('')
  const [primaryLanguageSpecification, setPrimaryLanguageSpecification] =
    useState('')
  const [language, setLanguage] = useState('')
  const [variantToDisplayId, setVariantToDisplayId] = useState('default')
  const [userOrgCode, setUserOrgCode] = useState('')

  // These are placeholders, in a real app you would fetch this data
  const [user] = useState<User | null>(null)
  const [studyData] = useState(null)
  const [supportedOrganisations] = useState(null)

  const allFilters = useQuestions()

  // In filter context, we don't need the complex logic for numbering and skipping questions
  // We just present all available filters.
  const filters = allFilters

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
