import { skipToken } from '@tanstack/react-query'
import { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import FilterAccordion from './FilterAccordion'
import { useFilterContext, filterConfigMap } from './filterContext'
import Filter from './filters/filter'

const FilterRenderer = ({ filter }: { filter: any }) => {
  const filters = useFilterContext()

  const buildFilter = (filter) => {
  
    const config = filterConfigMap(filters).get(filter.id)

    const state = config ? config.state : ''
    const setState = config ? config.setState : () => {}
    const displayType = config && config.displayType ? config.displayType : 'singlechoice'
    const superToggle = config && config.superToggle !== undefined ? config.superToggle : true
    const shortName = filter.shortName || filter.id

    const skipInSideBar = config ? config.hideInFilterSideBar : false
    return {...filter, displayType, state, setState, superToggle, shortName, skipInSideBar}
  }
  const filterToRender = buildFilter(filter)

  const variantId = updateVariantToDisplayId(filters.language, filters.primaryLanguage, filters.primaryLanguageSpecification)
  const variant = pickVariant(filter, variantId)
  if(!variant || variant.skipped || filterToRender.skipInSideBar){
    return null
  }

  return (
    <FilterAccordion
      key={filter.id}
      title={filterToRender.shortName}
    >
      <Filter variant={variant} filter={filterToRender} />
    </FilterAccordion>
  )
}

export default FilterRenderer
