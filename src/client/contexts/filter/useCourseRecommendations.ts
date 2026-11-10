import { useEffect, useState } from 'react'

import type { CourseData, Question, UserSettings } from '../../../common/types'
import useApiMutation from '../../hooks/useApiMutation'
import { pickVariant, type VariantQuery } from '../../hooks/useQuestions'
import { shouldFetchRecommendations } from '../../util/editModeAnswers'
import { filterCourseDatas, type FilterStateType } from './filterState'

type CourseRecommendationsInput = {
  filters: Question[]
  filterState: FilterStateType
  variantQuery: VariantQuery
  userOrgCode: string
  shouldUsePrimaryLanguageSpecification: boolean
  isEditMode: boolean
  userSettings: UserSettings | undefined
  userSettingsLoading: boolean
  refetchUserSettings: () => void
}

/**
 * Fetches recommendations from the server for the starting answers, then narrows them with the
 * local (sidebar) filters. Also keeps the saved education language in sync with the school language.
 */
const useCourseRecommendations = ({
  filters,
  filterState,
  variantQuery,
  userOrgCode,
  shouldUsePrimaryLanguageSpecification,
  isEditMode,
  userSettings,
  userSettingsLoading,
  refetchUserSettings,
}: CourseRecommendationsInput) => {
  const [courseRecommendations, setCourseRecommendations] = useState<CourseData[] | null>(null)
  const [finalRecommendedCourses, setFinalRecommendedCourses] = useState<CourseData[] | null>(null)
  const { primaryLanguage, setPrimaryLanguage, language, primaryLanguageSpecification } = filterState

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

  const submitSettingsMutation = useApiMutation(async (res: Response) => {
    if (!res.ok) {
      throw new Error('Network response was not ok')
    }
    refetchUserSettings()
  }, '/api/user/settings')

  useEffect(() => {
    setFinalRecommendedCourses(courseRecommendations)
  }, [courseRecommendations])

  const getTrueFilterValue = (filterOptionId: string, questionId: string) => {
    const filter = filters.find(f => f.id === questionId)
    if (!filter || !filter.variants) {
      return filterOptionId
    }

    const variant = pickVariant(filter, variantQuery)
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
    }

    submitAnswerMutation.mutateAsync(payload, undefined)
  }

  //setting the welcome modal open if there is no lang in db.
  useEffect(() => {
    if (!userSettingsLoading) {
      const lang = userSettings?.educationLanguage
      if (lang && lang.length > 0 && primaryLanguage != lang) {
        setPrimaryLanguage(lang)
      }
    }
  }, [userSettings])

  useEffect(() => {
    if (primaryLanguage && primaryLanguage.length > 0 && primaryLanguage != userSettings?.educationLanguage) {
      submitSettingsMutation.mutateAsync({ educationLanguage: primaryLanguage }, undefined)
    }
    if (!shouldFetchRecommendations({ isEditMode, organisationCode: userOrgCode })) {
      setCourseRecommendations([])
      return
    }
    submitFilters()
  }, [userOrgCode, primaryLanguage, language, primaryLanguageSpecification, isEditMode])

  useEffect(() => {
    const filtered = filterCourseDatas(courseRecommendations ?? [], filterState)

    setFinalRecommendedCourses(filtered)
  }, [
    filterState.previouslyDoneLang,
    filterState.replacement,
    filterState.mentoring,
    filterState.finmu,
    filterState.challenge,
    filterState.graduation,
    filterState.studyPlace,
    filterState.studyYear,
    filterState.studyPeriod,
    filterState.integrated,
    filterState.independent,
    filterState.mooc,
    filterState.collaboration,
    filterState.multiPeriod,
    filterState.flexible,
    courseRecommendations,
  ])

  return { courseRecommendations, finalRecommendedCourses }
}

export default useCourseRecommendations
