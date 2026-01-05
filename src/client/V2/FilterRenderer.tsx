import { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import FilterAccordion from './FilterAccordion'
import { useFilterContext } from './filterContext'
import Filter from './filters/filter'
import { filterTitles } from './sideBarContent'

const FilterRenderer = ({ filter }: { filter: any }) => {
  const filters = useFilterContext()

  const buildFilter = (filter) => {
  
    console.log('build filter CALLED')
    let state: any
    let setState: any
    let displayType: 'multichoice' | 'singlechoice' | 'dropdownselect'
    displayType = 'singlechoice'


    switch (filter.id) {
    case 'study-field-select':
      state = filters.studyField
      setState = filters.setStudyField
      displayType = 'dropdownselect'
      break
    case 'primary-language':
      state = filters.primaryLanguage
      setState = filters.setPrimaryLanguage
      break
    case 'lang':
      state = filters.language
      setState = filters.setLanguage
      break
    case 'primary-language-specification':
      state = filters.primaryLanguageSpecification
      setState = filters.setPrimaryLanguageSpecification
      break
    case 'previusly-done-lang':
      state = filters.previouslyDoneLang
      setState = filters.setPreviouslyDoneLang
      break
    case 'replacement':
      state = filters.replacement
      setState = filters.setReplacement
      break
    case 'mentoring':
      state = filters.mentoring
      setState = filters.setMentoring
      break
    case 'finmu':
      state = filters.finmu
      setState = filters.setFinmu
      break
    case 'challenge':
      state = filters.challenge
      setState = filters.setChallenge
      break
    case 'graduation':
      state = filters.graduation
      setState = filters.setGraduation
      break
    case 'integrated':
      state = filters.integrated
      setState = filters.setIntegrated
      break
    case 'independent':
      state = filters.independent
      setState = filters.setIndependent
      break
    case 'study-place':
      state = filters.studyPlace
      setState = filters.setStudyPlace
      displayType = 'multichoice'
      break
    case 'mooc':
      state = filters.mooc
      setState = filters.setMooc
      break
    default:
      console.log('this got hit')
      // Fallback for any unhandled filter types, assuming single choice
      state = ''
      setState = () => {}
      break
    }

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
