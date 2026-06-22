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

  const handleDelete = (valueId: string) => {
    if (Array.isArray(cfg.state)) {
      cfg.setState(cfg.state.filter((id: string) => id !== valueId))
    } else {
      cfg.setState('')
    }
  }

  return (
    <Box
      component="span"
      sx={{
        ml: 'auto',
        display: 'flex',
        flexDirection: 'row',
        gap: 0.5,
        flexWrap: 'wrap',
        zIndex: 2, // render above the mouseover highlight of accordion header
      }}
    >
      {activeChips.map(chip => (
        <HyChip
          key={chip.id}
          label={chip.label}
          onClick={e => {
            e?.stopPropagation()
            handleDelete(chip.id)
          }}
          size="small"
        />
      ))}
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
          {filter.mandatory && <HyTag text={t('question:mandatory')} colour="attention" ariaHidden={false} />}
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
