import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { toDayLabel } from '../../../common/datelabels.ts'
import type { RecommendationMetadata } from '../../../common/types.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useApi from '../../util/useApi.tsx'
import useRequiredUser from '../../util/useRequiredUser.ts'
import ActionButtonV2 from '../common/ActionButtonV2.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import AdminNavbar from './AdminNavbar.tsx'
import FeedbackMetadataDisplay from './FeedbackMetadataDisplay.tsx'

type UserFeedback = {
  id: number
  textFeedback: string
  stars: number
  date: string
  recommendationMetadata?: RecommendationMetadata | null
  appVersion?: string | null
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
              {new Date(feedback.date).toLocaleString()} |{' '}
              {t('v2:feedback.admin.starsValue', { stars: feedback.stars })}
              {feedback.appVersion && ` | v${feedback.appVersion}`}
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7 }}>
              {feedback.textFeedback}
            </Typography>

            {feedback.recommendationMetadata && (
              <>
                <Divider />
                <FeedbackMetadataDisplay metadata={feedback.recommendationMetadata} />
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose}>{t('v2:feedback.admin.close')}</BlackOutlinedButton>
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

  const { data, isLoading } = useApi<UserFeedback[]>(`admin-user-feedback-${start}-${end}`, endpoint, 'GET')

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading || !user) {
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
          onChange={event => setStart(event.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label={t('v2:feedback.admin.end')}
          type="date"
          value={end}
          onChange={event => setEnd(event.target.value)}
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
                <TableCell>{t('v2:feedback.admin.table.version')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.text')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbackRows.map(feedback => (
                <TableRow key={feedback.id}>
                  <TableCell>{new Date(feedback.date).toLocaleString()}</TableCell>
                  <TableCell>{t('v2:feedback.admin.starsValue', { stars: feedback.stars })}</TableCell>
                  <TableCell>{feedback.appVersion ?? '—'}</TableCell>
                  <TableCell sx={{ maxWidth: 520 }}>
                    <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {truncateFeedback(feedback.textFeedback)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
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

      <FeedbackCommentDialog feedback={selectedFeedback} onClose={() => setSelectedFeedback(null)} />
    </Box>
  )
}

export default UserFeedbackPage
