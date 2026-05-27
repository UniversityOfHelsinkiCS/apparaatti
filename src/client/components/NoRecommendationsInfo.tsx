import { Box, Typography, Paper } from '@mui/material'
import { useFilterContext } from '../contexts/filterContext'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'
import ResetFiltersButton from './ResetFiltersButton'
import ActionButtonV2 from './common/ActionButtonV2'

const NoRecommendationsInfo = () => {
  const { t, i18n } = useTranslation()
  const {
    studyField,
  } = useFilterContext()

  const additionalInfoKey = `v2:noRecommendations.additional-info-no-recommendations-md-${studyField}`
  const additionalInfo = i18n.exists(additionalInfoKey) ? t(additionalInfoKey) : null

  return (
    <Paper
      elevation={2}
      sx={{
        padding: 4,
        margin: 2,
        textAlign: 'center',
        backgroundColor: 'background.paper',
      }}
    >
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          {t('v2:noRecommendations.title')}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          {t('v2:noRecommendations.description')}
        </Typography>
        {additionalInfo && (
          <Box sx={{ mb: 3, textAlign: 'left' }}>
            <Markdown>{additionalInfo}</Markdown>
          </Box>
        )}
        <ResetFiltersButton>
          {({ label, openDialog }) => (
            <ActionButtonV2
              onClick={openDialog}
              text={label}
            />
          )}
        </ResetFiltersButton>
      </Box>
    </Paper>
  )
}

export default NoRecommendationsInfo
