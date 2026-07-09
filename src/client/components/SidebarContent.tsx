import { Box, Stack } from '@mui/material'
import { PanelLeftClose } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  filterConfigMap,
  isFilterStateAnswered,
  shouldShowFilterInSidebar,
  useFilterContext,
} from '../contexts/filterContext'
import HyButton from './common/hy/HyButton'
import HyIconButton from './common/hy/HyIconButton'
import FilterRenderer from './FilterRenderer'
import ResetFiltersButton from './ResetFiltersButton'

type SidebarContentProps = {
  onClose?: () => void
}

const SidebarContent = ({ onClose }: SidebarContentProps) => {
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
    <Box>
      <Stack
        direction="row"
        spacing="16px"
        sx={{ justifyContent: 'space-between', alignContent: 'center', p: '16px', pb: '12px' }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          <HyButton onClick={() => setModalOpen(true)}>{t('v2:retakeQuestions')}</HyButton>
          <Box sx={{ height: 12 }} />
          <ResetFiltersButton />
        </Box>
        {onClose && (
          <Box sx={{ alignSelf: 'start' }}>
            <HyIconButton
              color="inherit"
              aria-label={t('v2:closeFilters')}
              onClick={onClose}
              // negative margin matching 8px padding on IconButton to keep large hitbox without altering layout
              sx={{ m: '-2px' }}
            >
              <PanelLeftClose size={24} />
            </HyIconButton>
          </Box>
        )}
      </Stack>
      {filtersToShow.map((filter, index) => (
        <FilterRenderer
          key={filter.id}
          filter={filter}
          expanded={expandedFilterIds.has(filter.id)}
          onAccordionChange={(isExpanded: boolean) => {
            if (!isExpanded && unansweredMandatoryFilterIds.includes(filter.id)) return
            setExpandedFilterIds(prev => getNextExpandedFilterIds(filter.id, isExpanded, prev))
          }}
          isFirst={index === 0}
        />
      ))}
    </Box>
  )
}

export default SidebarContent
