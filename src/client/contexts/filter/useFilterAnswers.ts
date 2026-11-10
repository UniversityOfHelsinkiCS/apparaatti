import { useCallback, useEffect, useRef, useState } from 'react'

import { ANY_VARIANT_QUERY } from '../../../common/conditionMatching'
import type { Question, User } from '../../../common/types'
import { toVariantQuery } from '../../hooks/useQuestions'
import { getDefaultSelectedOptionIds } from '../../util/filterDefaults'
import { shouldResetFilter } from './filterRules'
import { filterConfigMap, type FilterStateType } from './filterState'
import type { OrganisationOption, StudyDataResponse } from './useFilterSources'

type FilterAnswersInput = {
  filters: Question[]
  filtersLoading: boolean
  user: User | undefined
  studyData: StudyDataResponse | undefined
  supportedOrganisations: OrganisationOption[] | undefined
}

/** The user's answer to every question, plus the defaults and resets that keep them consistent. */
const useFilterAnswers = ({ filters, filtersLoading, user, studyData, supportedOrganisations }: FilterAnswersInput) => {
  const [primaryLanguage, setPrimaryLanguage] = useState('')
  const [primaryLanguageSpecification, setPrimaryLanguageSpecification] = useState('')
  const [language, setLanguage] = useState('')
  const [studyField, setStudyField] = useState('')
  const [userOrgCode, setUserOrgCode] = useState('')
  // Prefill the organisation once on load (and again after a reset), so it can otherwise be cleared
  // on purpose, e.g. "mikä tahansa" when picking the edited variant in edit mode.
  const organisationInitialized = useRef(false)

  const shouldUsePrimaryLanguageSpecification = language !== '' && language !== 'en' && language === primaryLanguage

  const variantQuery = toVariantQuery(studyField, language, primaryLanguage, primaryLanguageSpecification)

  const [previouslyDoneLang, setPreviouslyDoneLang] = useState('')
  const [replacement, setReplacement] = useState('')
  const [mentoring, setMentoring] = useState('')
  const [finmu, setFinmu] = useState('')
  const [challenge, setChallenge] = useState('')
  const [graduation, setGraduation] = useState('')
  const [studyPlace, setStudyPlace] = useState<string[]>([])
  const [studyYear, setStudyYear] = useState('2026')
  const [studyPeriod, setStudyPeriod] = useState<string[]>([])
  const [integrated, setIntegrated] = useState('')
  const [independent, setIndependent] = useState('')
  const [mooc, setMooc] = useState('')
  const [collaboration, setCollaboration] = useState('')
  const [multiPeriod, setMultiPeriod] = useState('')
  const [flexible, setFlexible] = useState('')
  const [multichoiceDefaultsInitialized, setMultichoiceDefaultsInitialized] = useState(false)

  const getDefaultMultichoiceState = useCallback(
    (filterId: string) =>
      getDefaultSelectedOptionIds(
        filters.find(filter => filter.id === filterId),
        ANY_VARIANT_QUERY
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

  const resetFilters = () => {
    const sidebarFilterIds = new Set(filters.filter(filter => shouldResetFilter(filter)).map(filter => filter.id))
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
        config.setState('2026')
        return
      }

      config.setState('')
    })

    setUserOrgCode(studyField)
    organisationInitialized.current = false
  }

  useEffect(() => {
    if (organisationInitialized.current) {
      return
    }
    const organisations = user?.isAdmin ? supportedOrganisations : studyData?.organisations

    if (organisations && organisations.length > 0) {
      organisationInitialized.current = true
      if (!studyField) {
        const initialValue = organisations[0].code
        setStudyField(initialValue)
        setUserOrgCode(initialValue)
      }
    }
  }, [user, supportedOrganisations, studyData, studyField])

  return {
    filterState,
    variantQuery,
    shouldUsePrimaryLanguageSpecification,
    userOrgCode,
    setUserOrgCode,
    resetFilters,
  }
}

export default useFilterAnswers
