import { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import FilterAccordion from './FilterAccordion'
import { useFilterContext, filterConfigMap, shouldRenderWelcomeFilter } from '../contexts/filterContext'
import Filter from '../filters/filter'
import { Question } from '../../common/types'
import { SyntheticEvent } from 'react'

interface FilterRendererProps {
  filter: Question
  expanded: boolean
  onAccordionChange: (event: SyntheticEvent, isExpanded: boolean) => void
}

const FilterRenderer = ({ filter, expanded, onAccordionChange }: FilterRendererProps) => {
  const filters = useFilterContext()

  const config = filterConfigMap(filters).get(filter.id)
  const state = config ? config.state : ''
  const setState = config ? config.setState : () => {}
  const displayType = filter.displayType ?? 'singlechoice'
  const superToggle = filter.superToggle ?? false
  const shortName = filter.shortName ?? filter.id
  const skipInSideBar = filter.hideInFilterSidebar ?? false

  const filterToRender = { ...filter, displayType, state, setState, superToggle, shortName }

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
    <FilterAccordion
      key={filter.id}
      title={filterToRender.shortName}
      filterId={filter.id}
      mandatory={filter.mandatory}
      expanded={expanded}
      onChange={onAccordionChange}
    >
      <Filter variant={variant} filter={filterToRender} />
    </FilterAccordion>
  )
}

export default FilterRenderer
