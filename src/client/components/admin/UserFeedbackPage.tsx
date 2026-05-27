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
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ActionButtonV2 from '../common/ActionButtonV2.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import useRequiredUser from '../../util/useRequiredUser.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useApi from '../../util/useApi.tsx'

type UserFeedback = {
  id: number
  textFeedback: string
  stars: number
  date: string
}

const truncateFeedback = (text: string, maxLength = 140) => {
  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength).trimEnd()}...`
}

type FeedbackCommentDialogProps = {
  feedback: UserFeedback | null
  onClose: () => void
}

const FeedbackCommentDialog = ({ feedback, onClose }: FeedbackCommentDialogProps) => {
  return (
    <Dialog open={feedback !== null} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Feedback comment</DialogTitle>
      <DialogContent dividers>
        {feedback && (
          <Stack spacing={2}>
            <Typography color="text.secondary">
              {new Date(feedback.date).toLocaleString()} | {feedback.stars} / 5 stars
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7 }}>
              {feedback.textFeedback}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose}>
          Close
        </BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )
}

const UserFeedbackPage = () => {
  const navigate = useNavigate()
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null)
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const { data, isLoading } = useApi('admin-user-feedback', '/api/admin/user-feedback', 'GET', null) as {
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
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <BlackOutlinedButton onClick={() => navigate('/admin')}>Back to admin</BlackOutlinedButton>
      </Stack>
      <Typography variant="h4" sx={{ mb: 2 }}>
        User feedback
      </Typography>

      {isLoading ? (
        <Typography>Loading feedback...</Typography>
      ) : feedbackRows.length === 0 ? (
        <Typography>No feedback submitted yet.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Stars</TableCell>
                <TableCell>Text feedback</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbackRows.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{new Date(feedback.date).toLocaleString()}</TableCell>
                  <TableCell>{feedback.stars} / 5</TableCell>
                  <TableCell sx={{ maxWidth: 520 }}>
                    <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {truncateFeedback(feedback.textFeedback)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <ActionButtonV2
                      text="Read comment"
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
