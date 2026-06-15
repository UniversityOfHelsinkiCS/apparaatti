import {
  filterConfigMap,
  isFilterStateAnswered,
  shouldShowFilterInSidebar,
  useFilterContext,
} from '../contexts/filterContext'
import FilterRenderer from './FilterRenderer'
import { useTranslation } from 'react-i18next'
import DsButton from './common/DsButton'
import { Box } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import ResetFiltersButton from './ResetFiltersButton'

const SidebarContent = () => {
  const filterContext = useFilterContext()
  const { filters, isLoading, setModalOpen } = filterContext
  const { t } = useTranslation()
  const hasInitializedMandatoryFilters = useRef(false)
  const configMap = filterConfigMap(filterContext)

  const filtersToShow = filters.filter(filter => shouldShowFilterInSidebar(filter))
  const mandatoryFilterIds = new Set(filtersToShow.filter(filter => filter.mandatory).map(filter => filter.id))
  const unansweredMandatoryFilterIds = filtersToShow
    .filter(filter => {
      if (!filter.mandatory) {
        return false
      }

      const filterConfig = configMap.get(filter.id)
      return !filterConfig || !isFilterStateAnswered(filterConfig.state)
    })
    .map(filter => filter.id)
  const [expandedFilterIds, setExpandedFilterIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // When filters finish loading, initially open every mandatory filter that still needs an answer.
    if (isLoading || hasInitializedMandatoryFilters.current) {
      return
    }

    setExpandedFilterIds(new Set(unansweredMandatoryFilterIds))
    hasInitializedMandatoryFilters.current = true
  }, [isLoading, unansweredMandatoryFilterIds])

  useEffect(() => {
    // Keep newly introduced unanswered mandatory filters expanded after the initial setup runs.
    if (isLoading || !hasInitializedMandatoryFilters.current || unansweredMandatoryFilterIds.length === 0) {
      return
    }

    setExpandedFilterIds(previousExpandedFilterIds => {
      const hasNewUnansweredFilter = unansweredMandatoryFilterIds.some(
        filterId => !previousExpandedFilterIds.has(filterId)
      )

      if (!hasNewUnansweredFilter) {
        return previousExpandedFilterIds
      }

      const nextExpandedFilterIds = new Set(previousExpandedFilterIds)
      unansweredMandatoryFilterIds.forEach(filterId => {
        nextExpandedFilterIds.add(filterId)
      })
      return nextExpandedFilterIds
    })
  }, [isLoading, unansweredMandatoryFilterIds])

  const getNextExpandedFilterIds = (filterId: string, isExpanded: boolean, expandedFilterIds: Set<string>) => {
    if (!isExpanded) {
      const nextExpandedFilterIds = new Set(expandedFilterIds)
      nextExpandedFilterIds.delete(filterId)
      return nextExpandedFilterIds
    }

    const nextExpandedFilterIds = new Set<string>()

    expandedFilterIds.forEach(expandedFilterId => {
      if (expandedFilterId === filterId) {
        return
      }

      const expandedFilterConfig = configMap.get(expandedFilterId)
      const isMandatoryFilter = mandatoryFilterIds.has(expandedFilterId)
      const filterHasAnswer = expandedFilterConfig && isFilterStateAnswered(expandedFilterConfig.state)

      if (isMandatoryFilter && !filterHasAnswer) {
        nextExpandedFilterIds.add(expandedFilterId)
      }
    })

    nextExpandedFilterIds.add(filterId)
    return nextExpandedFilterIds
  }

  if (isLoading) {
    return <p>{t('v2:loadingFilters')}</p>
  }

  return (
    <Box
      sx={{
        px: { xs: 0.75, sm: 1.25 },
        pb: 2,
        minHeight: '100%',
        bgcolor: 'transparent',
      }}
    >
      <Box
        sx={{
          px: { xs: 0.5, sm: 0.75 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <DsButton onClick={() => setModalOpen(true)} text={t('v2:retakeQuestions')} variant="secondary" />
        <Box sx={{ height: 12 }} />
        <ResetFiltersButton>
          {({ label, openDialog }) => <DsButton onClick={openDialog} text={label} variant="secondary" />}
        </ResetFiltersButton>
      </Box>
      {filtersToShow.map(filter => (
        <FilterRenderer
          key={filter.id}
          filter={filter}
          expanded={expandedFilterIds.has(filter.id)}
          onAccordionChange={(_event: unknown, isExpanded: boolean) =>
            setExpandedFilterIds(prev => getNextExpandedFilterIds(filter.id, isExpanded, prev))
          }
        />
      ))}
    </Box>
  )
}

export default SidebarContent
