import { Box } from '@mui/material'
import { keyframes } from '@mui/material/styles'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { defaultVariant } from '../../common/conditionMatching'
import { Question } from '../../common/types'
import { resolveRenderableFilter } from '../contexts/filter/renderableFilter'
import { useFilterContext } from '../contexts/filterContext'
import { foreignLanguage } from '../util/contentLanguage'
import HyAccordion from './common/hy/HyAccordion'
import { hy } from './common/hy/hyTokens'
import { FilterAccordionAction, FilterAccordionSummary } from './FilterAccordionHeader'
import QuestionBody from './QuestionBody'

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

  const entry = resolveRenderableFilter(filter, filters)
  const sharedShortName = defaultVariant(filter.raw?.variants ?? [])?.shortName ?? filter.raw?.shortName
  const skipInSideBar = filter.hideInFilterSidebar ?? false

  if (!entry || skipInSideBar) {
    return null
  }

  const { variant, isFallback, shortName, shortNameSource } = entry
  const shortNameLanguage = shortNameSource.shortName
    ? foreignLanguage(shortNameSource.shortNameLanguage, i18n.resolvedLanguage ?? i18n.language)
    : undefined

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
          <FilterAccordionAction
            filterId={filter.id}
            shortName={shortName}
            triggerRef={triggerRef}
            variantName={variant.name}
            isFallbackVariant={isFallback}
            variantQuery={filters.variantQuery}
            filterVariants={filter.raw?.variants ?? []}
            current={variant.raw?.shortName ?? sharedShortName}
            filterText={sharedShortName}
          />
        }
        summary={
          <FilterAccordionSummary
            mandatory={Boolean(filter.mandatory)}
            shortName={shortName}
            shortNameLanguage={shortNameLanguage}
          />
        }
      >
        <QuestionBody entry={entry} variantQuery={filters.variantQuery} />
      </HyAccordion>
    </Box>
  )
}

export default FilterRenderer
