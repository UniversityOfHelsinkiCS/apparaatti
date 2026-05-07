import { Box, Button, Stack } from '@mui/material'
import FilterConfigEditor from './admin/FilterConfigEditor.tsx'
import { Navigate, useNavigate } from 'react-router-dom'
import useRequiredUser from '../util/useRequiredUser.ts'
import { RedirectToLogin } from '../util/redirectToLogin.ts'

const AdminPage = () => {
  const navigate = useNavigate()
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()

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

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/admin/stats')}
          sx={{ color: 'black', borderColor: 'black' }}
        >
          Stats
        </Button>
      </Stack>
      <FilterConfigEditor isSuperuser={user.isSuperuser === true} />
    </Box>
  )
}

export default AdminPage
