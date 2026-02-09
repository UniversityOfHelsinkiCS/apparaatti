import { useFilterContext } from './filterContext'
import FilterRenderer from './FilterRenderer.tsx'
import { useTranslation } from 'react-i18next'
import ActionButtonV2 from './components/ActionButtonV2'
import { Box } from '@mui/material'

const SidebarContent = () => {
  const { filters, isLoading, setModalOpen } = useFilterContext()
  const { t } = useTranslation()

  if (isLoading) {
    return <p>{t('v2:loadingFilters')}</p>
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
      {filtersToShow.map((filter) => (
        <FilterRenderer key={filter.id} filter={filter} />
      ))}
    </>
  )
}

export default SidebarContent
