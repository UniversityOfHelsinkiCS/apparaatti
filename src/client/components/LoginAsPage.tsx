import { Box } from '@mui/material'
import LoginAs from './LoginAs.tsx'
import { Navigate } from 'react-router-dom'
import useRequiredUser from '../util/useRequiredUser.ts'
import { RedirectToLogin } from '../util/redirectToLogin.ts'

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
      <LoginAs />
    </Box>
  )
}

export default LoginAsPage
