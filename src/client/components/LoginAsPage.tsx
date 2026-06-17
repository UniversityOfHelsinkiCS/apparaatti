import { Box } from '@mui/material'
import { Navigate } from 'react-router-dom'

import { RedirectToLogin } from '../util/redirectToLogin.ts'
import useRequiredUser from '../util/useRequiredUser.ts'
import AdminNavbar from './admin/AdminNavbar.tsx'
import LoginAs from './LoginAs.tsx'

const LoginAsPage = () => {
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

  const loginAs = localStorage.getItem('loginAsUser')
  if (loginAs) {
    if (window.confirm('leave loginas?')) {
      localStorage.removeItem('loginAsUser')
    }
  }

  if (!user.isSuperuser) {
    return <Navigate to={'/'} replace />
  }

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser={true} />
      <LoginAs />
    </Box>
  )
}

export default LoginAsPage
