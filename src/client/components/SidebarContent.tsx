import { filterConfigMap, useFilterContext } from '../contexts/filterContext'
import FilterRenderer from './FilterRenderer'
import { useTranslation } from 'react-i18next'
import ActionButtonV2 from './ActionButtonV2'
import { Box } from '@mui/material'

const SidebarContent = () => {
  const filterContext = useFilterContext()
  const { filters, isLoading, setModalOpen } = filterContext
  const { t } = useTranslation()

  if (isLoading) {
    return <p>{t('v2:loadingFilters')}</p>
  }

  const configMap = filterConfigMap(filterContext)
  const filtersToShow = filters.filter((f) => !configMap.get(f.id)?.showInWelcomeModal)

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
