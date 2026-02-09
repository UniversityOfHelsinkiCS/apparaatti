import { Box, Typography, Paper, Button } from '@mui/material'
import { useFilterContext } from '../filterContext'
import { useTranslation } from 'react-i18next'

const NoRecommendationsInfo = () => {
  const { t } = useTranslation()
  const {
    setPreviouslyDoneLang,
    setReplacement,
    setMentoring,
    setFinmu,
    setChallenge,
    setGraduation,
    setStudyPlace,
    setStudyPeriod,
    setIntegrated,
    setIndependent,
    setMooc,
    setStrictFilters,
  } = useFilterContext()

  const handleReset = () => {
    // Reset all non-mandatory filters to their default values
    setPreviouslyDoneLang('')
    setReplacement('')
    setMentoring('')
    setFinmu('')
    setChallenge('')
    setGraduation('')
    setStudyPlace([])
    setStudyPeriod([])
    setIntegrated('')
    setIndependent('')
    setMooc('')
    setStrictFilters([])
  }

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
        <Button
          variant="outlined"
          onClick={handleReset}
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
