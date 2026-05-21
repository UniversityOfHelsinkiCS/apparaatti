import {
  Box,
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
import { Navigate, useNavigate } from 'react-router-dom'
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

const UserFeedbackPage = () => {
  const navigate = useNavigate()
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
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbackRows.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>{new Date(feedback.date).toLocaleString()}</TableCell>
                  <TableCell>{feedback.stars} / 5</TableCell>
                  <TableCell>{feedback.textFeedback}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default UserFeedbackPage
