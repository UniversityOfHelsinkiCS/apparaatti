import { useFilterContext } from '../contexts/filterContext'
import FilterRenderer from './FilterRenderer'
import { useTranslation } from 'react-i18next'
import ActionButtonV2 from './common/ActionButtonV2'
import { Box } from '@mui/material'

const SidebarContent = () => {
  const filterContext = useFilterContext()
  const { filters, isLoading, setModalOpen } = filterContext
  const { t } = useTranslation()

  if (isLoading) {
    return <p>{t('v2:loadingFilters')}</p>
  }

  const filtersToShow = filters.filter((f) => !f.showInWelcomeModal)

  return (
    <Box
      sx={{
        px: { xs: 0.75, sm: 1.25 },
        pb: 2,
        minHeight: '100%',
        bgcolor: 'transparent',
      }}
    >
      <Box sx={{ px: { xs: 0.5, sm: 0.75 }, py: 2, display: 'flex', justifyContent: 'center' }}>
        <ActionButtonV2
          onClick={() => setModalOpen(true)}
          text={t('v2:retakeQuestions')}
          visualStyle="course-show"
        />
      </Box>
      {filtersToShow.map((filter) => (
        <FilterRenderer key={filter.id} filter={filter} />
      ))}
    </Box>
  )
}

export default SidebarContent
