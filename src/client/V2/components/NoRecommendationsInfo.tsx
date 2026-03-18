import { Box, Typography, Paper, Button } from '@mui/material'
import { useFilterContext } from '../filterContext'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'

const NoRecommendationsInfo = () => {
  const { t, i18n } = useTranslation()
  const {
    studyField,
    resetFilters,
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
        <Button
          variant="outlined"
          onClick={resetFilters}
          sx={{
            borderColor: '#90caf9',
            color: 'black',
            '&:hover': {
              backgroundColor: '#2196f3',
              color: 'white',
            },
          }}
        >
          {t('v2:noRecommendations.resetButton')}
        </Button>
      </Box>
    </Paper>
  )
}

export default NoRecommendationsInfo
