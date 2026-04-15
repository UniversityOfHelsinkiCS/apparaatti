import { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import FilterAccordion from './FilterAccordion'
import { useFilterContext, filterConfigMap } from '../contexts/filterContext'
import Filter from '../filters/filter'
import { Question } from '../../common/types'

const FilterRenderer = ({ filter }: { filter: Question }) => {
  const filters = useFilterContext()

  const config = filterConfigMap(filters).get(filter.id)
  const state = config ? config.state : ''
  const setState = config ? config.setState : () => {}
  const displayType = filter.displayType ?? 'singlechoice'
  const superToggle = filter.superToggle ?? false
  const shortName = filter.shortName ?? filter.id
  const skipInSideBar = filter.hideInFilterSidebar ?? false

  const filterToRender = { ...filter, displayType, state, setState, superToggle, shortName }

  const variantId = updateVariantToDisplayId(filters.language, filters.primaryLanguage, filters.primaryLanguageSpecification)
  const variant = pickVariant(filter, variantId)
  if (!variant || variant.skipped || skipInSideBar) {
    return null
  }

  return (
    <FilterAccordion
      key={filter.id}
      title={filterToRender.shortName}
      filterId={filter.id}
    >
      <Filter variant={variant} filter={filterToRender} />
    </FilterAccordion>
  )
}

export default FilterRenderer
