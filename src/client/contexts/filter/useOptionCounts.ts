import { useMemo } from 'react'

import type { CourseData, Question } from '../../../common/types'
import { pickVariant, type VariantQuery } from '../../hooks/useQuestions'
import { filterCourseDatas, type FilterStateType, localFilterStateKeys } from './filterState'

type OptionCountsInput = {
  filters: Question[]
  filterState: FilterStateType
  variantQuery: VariantQuery
  courseRecommendations: CourseData[] | null
}

/** How many courses each local filter option would leave visible. */
const useOptionCounts = ({ filters, filterState, variantQuery, courseRecommendations }: OptionCountsInput) => {
  /**
   * Precomputed map of `${filterId}:${optionId}` → course count that would be
   * visible if that option were selected (given all other active filters).
   * Only populated for local (client-side) filter ids.
   */
  const optionCountMap = useMemo(() => {
    const map = new Map<string, number>()

    for (const question of filters) {
      const stateKey = localFilterStateKeys[question.id]
      if (!stateKey) continue

      const variant = pickVariant(question, variantQuery)
      if (!variant || variant.skipped || !variant.options) continue

      for (const option of variant.options) {
        let hypotheticalValue: string | string[]

        if (question.displayType === 'multichoice') {
          // Show how many courses match this option alone (with all other filters active)
          hypotheticalValue = [option.id]
        } else {
          // singlechoice and dropdownselect: replace
          hypotheticalValue = option.id
        }

        const hypotheticalState = { ...filterState, [stateKey]: hypotheticalValue }
        const count = filterCourseDatas(courseRecommendations ?? [], hypotheticalState).length
        map.set(`${question.id}:${option.id}`, count)
      }
    }

    return map
  }, [
    courseRecommendations,
    filters,
    variantQuery,
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
  ])

  const getOptionCount = (filterId: string, optionId: string): number | null => {
    if (!(filterId in localFilterStateKeys)) return null
    return optionCountMap.get(`${filterId}:${optionId}`) ?? null
  }

  return { getOptionCount }
}

export default useOptionCounts
