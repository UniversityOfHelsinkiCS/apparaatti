import { useEffect, useState } from 'react'

import type { Question, UserSettings } from '../../../common/types'
import type { VariantQuery } from '../../hooks/useQuestions'
import { shouldAutoOpenWelcomeModal } from '../../util/editModeAnswers'
import { getUnansweredCurrentMandatoryFilters } from './filterRules'
import type { FilterStateType } from './filterState'

type WelcomeModalInput = {
  filters: Question[]
  filterState: FilterStateType
  variantQuery: VariantQuery
  isLoading: boolean
  isEditMode: boolean
  userSettings: UserSettings | undefined
}

/** Open state of the welcome modal, opened automatically when starting questions need answers. */
const useWelcomeModal = ({
  filters,
  filterState,
  variantQuery,
  isLoading,
  isEditMode,
  userSettings,
}: WelcomeModalInput) => {
  const [modalOpen, setModalOpen] = useState(false)

  const unansweredModalMandatoryKey = getUnansweredCurrentMandatoryFilters(
    filters.filter(filter => filter.showInWelcomeModal),
    { ...filterState, variantQuery }
  )
    .map(filter => filter.id)
    .join(',')

  useEffect(() => {
    if (isLoading) {
      return
    }

    const hasVisited = sessionStorage.getItem('hasVisitedV2') !== null
    sessionStorage.setItem('hasVisitedV2', 'true')

    const shouldOpen = shouldAutoOpenWelcomeModal({
      isEditMode,
      hasUnansweredMandatory: unansweredModalMandatoryKey !== '',
      hasVisited,
      //preventing the modal from automatically opening if the user already has a first language
      hasEducationLanguage: Boolean(userSettings?.educationLanguage),
    })
    if (shouldOpen) {
      setModalOpen(true)
    }
  }, [isLoading, unansweredModalMandatoryKey, userSettings, isEditMode])

  return { modalOpen, setModalOpen }
}

export default useWelcomeModal
