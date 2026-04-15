import { Box } from '@mui/material'
import FilterConfigEditor from './admin/FilterConfigEditor.tsx'
import { Navigate } from 'react-router-dom'
import useRequiredUser from '../util/useRequiredUser.ts'
import { RedirectToLogin } from '../util/redirectToLogin.ts'

const AdminPage = () => {
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
      <FilterConfigEditor isSuperuser={user.isSuperuser === true} />
    </Box>
  )
}

export default AdminPage
