import { Box, Stack } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Question } from '../../common/types'
import { shouldRenderWelcomeFilter } from '../contexts/filter/filterRules'
import { filterConfigMap } from '../contexts/filter/filterState'
import { useFilterContext } from '../contexts/filterContext'
import { useFilterEditMode } from '../contexts/filterEditModeContext'
import Filter from '../filters/filter'
import { resolveVariant } from '../hooks/useQuestions'
import { foreignLanguage } from '../util/contentLanguage'
import ActiveFilterChips from './ActiveFilterChips'
import HyAccordion from './common/hy/HyAccordion'
import HyTag from './common/hy/HyTag'
import { hy } from './common/hy/hyTokens'
import FilterTextEditHandle from './editMode/FilterTextEditHandle'
import StudyPhaseQuestion from './StudyPhaseQuestion'

const flashHighlight = keyframes({
  '0%': { opacity: 0 },
  '20%': { opacity: 0.5 },
  '50%': { opacity: 0 },
  '70%': { opacity: 0.5 },
  '100%': { opacity: 0 },
})

const HIGHLIGHT_DURATION_MS = 1500

interface FilterRendererProps {
  filter: Question
  expanded: boolean
  onAccordionChange: (isExpanded: boolean) => void
  isFirst: boolean
  lockedOpen?: boolean
}

const FilterRenderer = ({ filter, expanded, onAccordionChange, isFirst, lockedOpen }: FilterRendererProps) => {
  const { t, i18n } = useTranslation()
  const filters = useFilterContext()
  const { isEditMode } = useFilterEditMode()
  const { highlightedFilterId, setHighlightedFilterId } = filters
  const isHighlighted = highlightedFilterId === filter.id
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isHighlighted) {
      return undefined
    }

    triggerRef.current?.focus()

    const timeout = setTimeout(() => setHighlightedFilterId(null), HIGHLIGHT_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [isHighlighted, setHighlightedFilterId])

  const config = filterConfigMap(filters).get(filter.id)
  const state = config ? config.state : ''
  const setState = config ? config.setState : () => {}
  const displayType = filter.displayType ?? 'singlechoice'
  const shortName = filter.shortName ?? filter.id
  const shortNameLanguage = filter.shortName
    ? foreignLanguage(filter.shortNameLanguage, i18n.resolvedLanguage ?? i18n.language)
    : undefined
  const skipInSideBar = filter.hideInFilterSidebar ?? false

  const filterToRender = { ...filter, displayType, state, setState, shortName }

  const { variant, isFallback } = resolveVariant(filter, filters.variantQuery)
  const shouldRenderFilter = shouldRenderWelcomeFilter(filter.id, variant, filters.language, filters.primaryLanguage)

  if (!variant || !shouldRenderFilter || skipInSideBar) {
    return null
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {isHighlighted && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            backgroundColor: hy.bgColor.attention,
            pointerEvents: 'none',
            animation: `${flashHighlight} ${HIGHLIGHT_DURATION_MS}ms ease-out forwards`,
          }}
        />
      )}
      <HyAccordion
        open={expanded}
        onChange={onAccordionChange}
        variant="compact"
        animate
        borders={isFirst ? 'both' : 'bottom'}
        triggerRef={triggerRef}
        lockedOpenLabel={lockedOpen ? t('v2:filter.mandatoryStaysOpen') : undefined}
        action={
          <Stack direction="row" spacing={0.5} alignItems="center">
            <ActiveFilterChips filterId={filter.id} focusRef={triggerRef} />
            {isEditMode && (
              <FilterTextEditHandle
                filterId={filter.id}
                field="shortName"
                current={filter.raw?.shortName}
                label={t('v2:filterWordings.editName', { name: shortName })}
              />
            )}
          </Stack>
        }
        summary={
          <Box
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              flexWrap: 'wrap',
              gap: 1,
              '& > *': { minHeight: '26px' },
            }}
          >
            {filter.mandatory && (
              <HyTag
                text={t('question:mandatory')}
                colour="attention"
                sx={{ border: '1px solid', borderColor: hy.borderColor.light }}
              />
            )}
            <Box component="span" lang={shortNameLanguage} sx={{ flexGrow: 1 }}>
              {shortName}
            </Box>
          </Box>
        }
      >
        {filter.id === 'study-field-select' ? (
          <StudyPhaseQuestion question={filter} />
        ) : (
          <Filter
            variant={variant}
            filter={filterToRender}
            variantName={variant.name}
            isFallbackVariant={isFallback}
            variantQuery={filters.variantQuery}
          />
        )}
      </HyAccordion>
    </Box>
  )
}

export default FilterRenderer
