import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Stack, Paper } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useTranslation } from 'react-i18next'
import type { RecommendationMetadata } from '../../../common/types.ts'

type FeedbackMetadataDisplayProps = {
  metadata: RecommendationMetadata
}

const FeedbackMetadataDisplay = ({ metadata }: FeedbackMetadataDisplayProps) => {
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('v2:feedback.admin.metadata.title')}
      </Typography>

      {/* Filter Selections (AnswerData) */}
      {!!metadata.filterState && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('v2:feedback.admin.metadata.filterSelections')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              {Object.entries(metadata.filterState).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null

                const displayValue = Array.isArray(value) ? value.join(', ') : String(value)

                return (
                  <Box key={key} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        minWidth: 200,
                        color: 'text.secondary',
                      }}
                    >
                      {key}:
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      {displayValue}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Recommendations */}
      {metadata?.courses?.length > 0 && (
        <Accordion defaultExpanded={!metadata.filterState}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('v2:feedback.admin.metadata.recommendations')} ({metadata.courses.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {metadata.courses.map((rec, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, backgroundColor: 'background.default' }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                        {rec.name.fi || rec.name.en || rec.name.sv || 'Unnamed Course'}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      <strong>ID:</strong> {rec.id}
                    </Typography>

                    {rec.courseCodes.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('v2:feedback.admin.metadata.courseCodes')}:</strong> {rec.courseCodes.join(', ')}
                      </Typography>
                    )}

                    {rec.startDate && rec.endDate && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('v2:feedback.admin.metadata.period')}:</strong>{' '}
                        {new Date(rec.startDate).toLocaleDateString()} - {new Date(rec.endDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  )
}

export default FeedbackMetadataDisplay
