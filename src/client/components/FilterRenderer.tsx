import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { Question } from '../../common/types'
import {
  filterConfigMap,
  getFilterVariant,
  shouldRenderWelcomeFilter,
  useFilterContext,
} from '../contexts/filterContext'
import Filter from '../filters/filter'
import { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import HyAccordion from './common/hy/HyAccordion'
import HyChip from './common/hy/HyChip'
import HyTag from './common/hy/HyTag'

interface ActiveFilterChipsProps {
  filterId: string
}

const ActiveFilterChips = ({ filterId }: ActiveFilterChipsProps) => {
  const filterContext = useFilterContext()
  const cfg = filterConfigMap(filterContext).get(filterId)
  const variant = getFilterVariant(filterContext, filterId)

  if (!cfg) return null

  const activeChips: { id: string; label: string }[] = []
  if (Array.isArray(cfg.state)) {
    cfg.state.forEach((valueId: string) => {
      const option = variant?.options?.find((o: any) => o.id === valueId)
      activeChips.push({ id: valueId, label: option?.name || valueId })
    })
  } else if (cfg.state !== '') {
    const option = variant?.options?.find((o: any) => o.id === cfg.state)
    activeChips.push({ id: cfg.state, label: option?.name || cfg.state })
  }

  if (activeChips.length === 0) return null

  const handleClear = () => {
    cfg.setState(Array.isArray(cfg.state) ? [] : '')
  }

  // Format chip label to always fit comfortably in header
  const MAX_CHARS = 31
  const labels = activeChips.map(c => c.label)
  const fullLabel = labels.join(', ')
  let chipLabel: string
  if (fullLabel.length <= MAX_CHARS) {
    chipLabel = fullLabel
  } else {
    let acc = ''
    let shown = 0
    for (let i = 0; i < labels.length; i++) {
      const candidate = i === 0 ? labels[i] : `${acc}, ${labels[i]}`
      const remaining = labels.length - i - 1
      const withSuffix = remaining > 0 ? `${candidate}... + ${remaining}` : candidate
      if (withSuffix.length <= MAX_CHARS || i === 0) {
        acc = candidate
        shown = i + 1
      } else {
        break
      }
    }
    const extra = labels.length - shown
    chipLabel = extra > 0 ? `${acc}... + ${extra}` : acc
  }

  return (
    <Box
      component="span"
      sx={{
        ml: 'auto',
        zIndex: 2, // render above the mouseover highlight of accordion header
      }}
    >
      <HyChip
        label={chipLabel}
        onClick={e => {
          e?.stopPropagation()
          handleClear()
        }}
        size="small"
      />
    </Box>
  )
}

interface FilterRendererProps {
  filter: Question
  expanded: boolean
  onAccordionChange: (isExpanded: boolean) => void
  isFirst: boolean
}

const FilterRenderer = ({ filter, expanded, onAccordionChange, isFirst }: FilterRendererProps) => {
  const { t } = useTranslation()
  const filters = useFilterContext()

  const config = filterConfigMap(filters).get(filter.id)
  const state = config ? config.state : ''
  const setState = config ? config.setState : () => {}
  const displayType = filter.displayType ?? 'singlechoice'
  const shortName = filter.shortName ?? filter.id
  const skipInSideBar = filter.hideInFilterSidebar ?? false

  const filterToRender = { ...filter, displayType, state, setState, shortName }

  const variantId = updateVariantToDisplayId(
    filters.language,
    filters.primaryLanguage,
    filters.primaryLanguageSpecification
  )
  const variant = pickVariant(filter, variantId)
  const shouldRenderFilter = shouldRenderWelcomeFilter(filter.id, variant, filters.language, filters.primaryLanguage)

  if (!variant || !shouldRenderFilter || skipInSideBar) {
    return null
  }

  return (
    <HyAccordion
      open={expanded}
      onChange={onAccordionChange}
      variant="compact"
      animate
      borders={isFirst ? 'both' : 'bottom'}
      summary={
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 1 }}>
          {filter.mandatory && !state.length && (
            <HyTag
              text={t('question:mandatory')}
              colour="attention"
              ariaHidden={false}
              sx={{ boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.2)' }}
            />
          )}
          {shortName}
          <ActiveFilterChips filterId={filter.id} />
        </Box>
      }
    >
      <Filter variant={variant} filter={filterToRender} />
    </HyAccordion>
  )
}

export default FilterRenderer
