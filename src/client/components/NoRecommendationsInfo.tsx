import { Box, Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'

import { getUnansweredCurrentMandatoryFilters, useFilterContext } from '../contexts/filterContext'
import ResetFiltersButton from './ResetFiltersButton'

type UnansweredPromtProps = {
  filters: { id: string; shortName?: string }[]
}

const UnansweredPromt = ({ filters }: UnansweredPromtProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body1" sx={{ mb: 1.5, fontWeight: 600 }}>
        Vastaa viela pakolliseen kysymykseen
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        {filters.map(filter => (
          <Box
            key={filter.id}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              backgroundColor: 'grey.100',
              border: theme => `1px solid ${theme.palette.divider}`,
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            {filter.shortName ?? filter.id}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const NoRecommendationsInfo = () => {
  const { t, i18n } = useTranslation()
  const filterContext = useFilterContext()
  const { studyField, filters } = filterContext

  const additionalInfoKey = `v2:noRecommendations.additional-info-no-recommendations-md-${studyField}`
  const additionalInfo = i18n.exists(additionalInfoKey) ? t(additionalInfoKey) : null

  const mandatoryFilters = getUnansweredCurrentMandatoryFilters(filters, filterContext)

  return (
    <Box>
      <Stack>
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
            {mandatoryFilters.length > 0 ? (
              <UnansweredPromt filters={mandatoryFilters}></UnansweredPromt>
            ) : (
              <>
                {additionalInfo && (
                  <Box sx={{ mb: 3, textAlign: 'left' }}>
                    <Markdown>{additionalInfo}</Markdown>
                  </Box>
                )}
                <ResetFiltersButton />
              </>
            )}
          </Box>
        </Paper>
      </Stack>
    </Box>
  )
}

export default NoRecommendationsInfo
