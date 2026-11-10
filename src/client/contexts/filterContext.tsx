import { createContext, ReactNode, useContext, useState } from 'react'

import type { CourseData, Question, User } from '../../common/types'
import useQuestions, { type VariantQuery } from '../hooks/useQuestions'
import type { FilterStateType } from './filter/filterState'
import useCourseRecommendations from './filter/useCourseRecommendations'
import useFilterAnswers from './filter/useFilterAnswers'
import useFilterSources, { type OrganisationOption, type StudyDataResponse } from './filter/useFilterSources'
import useOptionCounts from './filter/useOptionCounts'
import useWelcomeModal from './filter/useWelcomeModal'
import { useFilterEditMode } from './filterEditModeContext'

export interface FilterContextType extends FilterStateType {
  variantQuery: VariantQuery

  filters: Question[]
  user: User | undefined
  studyData: StudyDataResponse | undefined
  supportedOrganisations: OrganisationOption[] | undefined
  setUserOrgCode: (s: string) => void
  courseRecommendations: CourseData[] | null
  isLoading: boolean
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  finalRecommendedCourses: CourseData[] | null
  highlightedFilterId: string | null
  setHighlightedFilterId: (filterId: string | null) => void

  resetFilters: () => void
  getOptionCount: (optionId: string, filterId: string) => number | null
  filterState: FilterStateType
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const FilterContextProvider = ({ children }: { children: ReactNode }) => {
  const { isEditMode } = useFilterEditMode()
  const [highlightedFilterId, setHighlightedFilterId] = useState<string | null>(null)
  const { filters, isLoading: filtersLoading } = useQuestions()
  const sources = useFilterSources()
  const isLoading = sources.isLoading || filtersLoading

  // Hook order matters: React runs effects in call order (answers → welcome modal → recommendations).
  const answers = useFilterAnswers({
    filters,
    filtersLoading,
    user: sources.user,
    studyData: sources.studyData,
    supportedOrganisations: sources.supportedOrganisations,
  })
  const { filterState, variantQuery } = answers

  const { modalOpen, setModalOpen } = useWelcomeModal({
    filters,
    filterState,
    variantQuery,
    isLoading,
    isEditMode,
    userSettings: sources.userSettings,
  })

  const { courseRecommendations, finalRecommendedCourses } = useCourseRecommendations({
    filters,
    filterState,
    variantQuery,
    userOrgCode: answers.userOrgCode,
    shouldUsePrimaryLanguageSpecification: answers.shouldUsePrimaryLanguageSpecification,
    isEditMode,
    userSettings: sources.userSettings,
    userSettingsLoading: sources.userSettingsLoading,
    refetchUserSettings: sources.refetchUserSettings,
  })

  const { getOptionCount } = useOptionCounts({ filters, filterState, variantQuery, courseRecommendations })

  return (
    <FilterContext.Provider
      value={{
        ...filterState,
        filterState,
        variantQuery,
        filters,
        user: sources.user,
        studyData: sources.studyData,
        supportedOrganisations: sources.supportedOrganisations,
        setUserOrgCode: answers.setUserOrgCode,
        courseRecommendations,
        finalRecommendedCourses,
        isLoading,
        modalOpen,
        setModalOpen,
        highlightedFilterId,
        setHighlightedFilterId,
        resetFilters: answers.resetFilters,
        getOptionCount,
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
