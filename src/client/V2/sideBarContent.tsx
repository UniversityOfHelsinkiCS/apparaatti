import { useFilterContext } from './filterContext'
import FilterAccordion from './FilterAccordion'
import FilterRenderer from './FilterRenderer'

const filterTitles: { [key: string]: string } = {
  'study-field-select': 'Study Field',
  'primary-language': 'Primary Language',
  lang: 'Language of Study',
  'primary-language-specification': 'Language Skills',
  'previusly-done-lang': 'Previous Language Studies',
  replacement: 'Replacement Courses',
  mentoring: 'Mentoring',
  finmu: 'Finmu',
  challenge: 'Extra Challenge',
  graduation: 'Close to Graduation',
  'study-place': 'Study Method',
  integrated: 'Integrated Studies',
  independent: 'Independent Study',
}

const SidebarContent = () => {
  const { filters } = useFilterContext()

  return (
    <>
      {filters.map((filter) => (
        <FilterAccordion
          key={filter.id}
          title={filterTitles[filter.id] || filter.id}
        >
          <FilterRenderer filter={filter} />
        </FilterAccordion>
      ))}
    </>
  )
}

export default SidebarContent