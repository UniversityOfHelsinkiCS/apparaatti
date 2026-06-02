import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import AdminNavbar from './AdminNavbar.tsx'
import ActionButtonV2 from '../common/ActionButtonV2.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import { toDayLabel } from '../../../common/datelabels.ts'
import useRequiredUser from '../../util/useRequiredUser.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useApi from '../../util/useApi.tsx'
import type { RecommendationMetadata } from '../../../common/types.ts'

type UserFeedback = {
  id: number
  textFeedback: string
  stars: number
  date: string
  recommendationMetadata?: RecommendationMetadata | null
}

const truncateFeedback = (text: string, maxLength = 140) => {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

const getDefaultStart = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 1)
  return toDayLabel(date)
}

const getDefaultEnd = () => toDayLabel(new Date())

type FeedbackCommentDialogProps = {
  feedback: UserFeedback | null
  onClose: () => void
}

const FeedbackCommentDialog = ({ feedback, onClose }: FeedbackCommentDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog open={feedback !== null} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t('v2:feedback.admin.dialogTitle')}</DialogTitle>
      <DialogContent dividers>
        {feedback && (
          <Stack spacing={3}>
            <Typography color="text.secondary">
              {new Date(feedback.date).toLocaleString()} | {t('v2:feedback.admin.starsValue', { stars: feedback.stars })}
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7 }}>
              {feedback.textFeedback}
            </Typography>

            {feedback.recommendationMetadata && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('v2:feedback.admin.metadata.title')}
                  </Typography>

                  {/* Filter Selections (AnswerData) */}
                  {feedback.recommendationMetadata.answerData && (
                    <Accordion defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {t('v2:feedback.admin.metadata.filterSelections')}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={1.5}>
                          {Object.entries(feedback.recommendationMetadata.answerData).map(([key, value]) => {
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
                  {feedback.recommendationMetadata.recommendations && feedback.recommendationMetadata.recommendations.length > 0 && (
                    <Accordion defaultExpanded={!feedback.recommendationMetadata.answerData}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {t('v2:feedback.admin.metadata.recommendations')} ({feedback.recommendationMetadata.recommendations.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {feedback.recommendationMetadata.recommendations.map((rec, index) => (
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
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose}>
          {t('v2:feedback.admin.close')}
        </BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )
}

const UserFeedbackPage = () => {
  const { t } = useTranslation()
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null)
  const [start, setStart] = useState(getDefaultStart)
  const [end, setEnd] = useState(getDefaultEnd)
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const startDateTime = `${start}T00:00:00.000Z`
  const endDateTime = `${end}T23:59:59.999Z`
  const endpoint = `/api/admin/user-feedback?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`

  const { data, isLoading } = useApi(`admin-user-feedback-${start}-${end}`, endpoint, 'GET', null) as {
    data: UserFeedback[] | null
    isLoading: boolean
  }

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Loading...</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  const feedbackRows = Array.isArray(data) ? data : []

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser={user.isSuperuser === true} />
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t('v2:feedback.admin.pageTitle')}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label={t('v2:feedback.admin.start')}
          type="date"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label={t('v2:feedback.admin.end')}
          type="date"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <BlackOutlinedButton
          onClick={() => {
            setStart(getDefaultStart())
            setEnd(getDefaultEnd())
          }}
        >
          {t('v2:feedback.admin.last12Months')}
        </BlackOutlinedButton>
      </Stack>

      {isLoading ? (
        <Typography>{t('v2:feedback.admin.loading')}</Typography>
      ) : feedbackRows.length === 0 ? (
        <Typography>{t('v2:feedback.admin.empty')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('v2:feedback.admin.table.date')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.stars')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.text')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.metadata')}</TableCell>
                <TableCell align="right">{t('v2:feedback.admin.table.action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbackRows.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{new Date(feedback.date).toLocaleString()}</TableCell>
                  <TableCell>{t('v2:feedback.admin.starsValue', { stars: feedback.stars })}</TableCell>
                  <TableCell sx={{ maxWidth: 520 }}>
                    <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {truncateFeedback(feedback.textFeedback)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {feedback.recommendationMetadata ? (
                      <Chip
                        label={t('v2:feedback.admin.table.hasMetadata')}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label={t('v2:feedback.admin.table.noMetadata')}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <ActionButtonV2
                      text={t('v2:feedback.admin.readComment')}
                      type="button"
                      onClick={() => setSelectedFeedback(feedback)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FeedbackCommentDialog
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
      />
    </Box>
  )
}

export default UserFeedbackPage
