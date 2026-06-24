import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { Question } from '../../common/types'
import { filterConfigMap, shouldRenderWelcomeFilter, useFilterContext } from '../contexts/filterContext'
import Filter from '../filters/filter'
import { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import ActiveFilterChips from './ActiveFilterChips'
import HyAccordion from './common/hy/HyAccordion'
import HyTag from './common/hy/HyTag'
import { hy } from './common/hy/hyTokens'

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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            flexWrap: 'wrap',
            gap: 1,
            '& > *': { height: '25px' },
          }}
        >
          {filter.mandatory && !state.length && (
            <HyTag
              text={t('question:mandatory')}
              colour="attention"
              ariaHidden={false}
              sx={{ border: '1px solid', borderColor: hy.borderColor.light }}
            />
          )}
          <Box component="span" sx={{ flexGrow: 1 }}>
            {shortName}
          </Box>
          <ActiveFilterChips filterId={filter.id} />
        </Box>
      }
    >
      <Filter variant={variant} filter={filterToRender} />
    </HyAccordion>
  )
}

export default FilterRenderer
