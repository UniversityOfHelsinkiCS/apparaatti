import { useFilterContext } from './filterContext'
import FilterAccordion from './FilterAccordion'
import FilterRenderer from './FilterRenderer'
import PeriodFilter from './filters/PeriodFilter'
import { useTranslation } from 'react-i18next'
import ActionButtonV2 from './components/ActionButtonV2'
import { Box } from '@mui/material'

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
  const { filters, isLoading, setModalOpen } = useFilterContext()
  const { t } = useTranslation()

  if (isLoading) {
    return <p>Loading filters...</p>
  }

  const filtersToShow = filters.filter(
    (f) =>
      ![
        'study-field-select',
        'primary-language',
        'lang',
        'primary-language-specification',
      ].includes(f.id)
  )

  return (
    <>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <ActionButtonV2
          onClick={() => setModalOpen(true)}
          text={t('v2:retakeQuestions')}
        />
      </Box>
      <FilterAccordion title={t('v2:periodFilter:title')}>
        <PeriodFilter />
      </FilterAccordion>
      {filtersToShow.map((filter) => (
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