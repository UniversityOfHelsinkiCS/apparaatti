import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Paper,
  Chip,
} from '@mui/material'
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
      {metadata.answerData && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('v2:feedback.admin.metadata.filterSelections')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              {Object.entries(metadata.answerData).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null

                const displayValue = Array.isArray(value) ? value.join(', ') : String(value)

                return (
                  <Box key={key} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        minWidth: 200,
                        color: 'text.secondary'
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
      {metadata.recommendations && metadata.recommendations.length > 0 && (
        <Accordion defaultExpanded={!metadata.answerData}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('v2:feedback.admin.metadata.recommendations')} ({metadata.recommendations.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {metadata.recommendations.map((rec, index) => (
                <Paper
                  key={index}
                  variant="outlined"
                  sx={{ p: 2, backgroundColor: 'background.default' }}
                >
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                        {rec.course.name.fi || rec.course.name.en || rec.course.name.sv || 'Unnamed Course'}
                      </Typography>
                      {rec.points !== undefined && (
                        <Chip
                          label={`${t('v2:feedback.admin.metadata.points')}: ${rec.points}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      <strong>ID:</strong> {rec.course.id}
                    </Typography>

                    {rec.course.courseCodes.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('v2:feedback.admin.metadata.courseCodes')}:</strong> {rec.course.courseCodes.join(', ')}
                      </Typography>
                    )}

                    {rec.course.startDate && rec.course.endDate && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('v2:feedback.admin.metadata.period')}:</strong>{' '}
                        {new Date(rec.course.startDate).toLocaleDateString()} - {new Date(rec.course.endDate).toLocaleDateString()}
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
