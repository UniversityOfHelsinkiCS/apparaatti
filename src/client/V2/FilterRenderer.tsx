import { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import FilterAccordion from './FilterAccordion'
import { useFilterContext, filterConfigMap } from './filterContext'
import Filter from './filters/filter'
import { filterTitles } from './sideBarContent'

const FilterRenderer = ({ filter }: { filter: any }) => {
  const filters = useFilterContext()

  const buildFilter = (filter) => {
  
    console.log('build filter CALLED')

    const config = filterConfigMap(filters).get(filter.id)

    const state = config ? config.state : ''
    const setState = config ? config.setState : () => {}
    const displayType = config && config.displayType ? config.displayType : 'singlechoice'

    return {...filter, displayType, state, setState}
  }
  const filterToRender = buildFilter(filter)

  const variantId = updateVariantToDisplayId(filters.language, filters.primaryLanguage, filters.primaryLanguageSpecification)
  const variant = pickVariant(filter, variantId)
  if(!variant || variant.skipped){
    return null
  }

  return (
    <FilterAccordion
      key={filter.id}
      title={filterTitles[filter.id] || filter.id}
    >
      <Filter variant={variant} filter={filterToRender} />
    </FilterAccordion>
  )
}

export default FilterRenderer
