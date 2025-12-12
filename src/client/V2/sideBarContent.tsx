import { useFilterContext } from './filterContext'
import FilterAccordion from './FilterAccordion'
import FilterRenderer from './FilterRenderer'
import PeriodFilter from './filters/PeriodFilter' // Import PeriodFilter
import { useTranslation } from 'react-i18next' // Import useTranslation

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
  const { filters, isLoading } = useFilterContext()
  const { t } = useTranslation() // Initialize useTranslation

  if (isLoading) {
    return <p>Loading filters...</p>
  }

  return (
    <>
      <FilterAccordion title={t('v2:periodFilter:title')}>
        <PeriodFilter />
      </FilterAccordion>
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
