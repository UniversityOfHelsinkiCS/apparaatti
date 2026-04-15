import { Box } from '@mui/material'
import LoginAs from './LoginAs.tsx'
import useApi from '../util/useApi.tsx'
import { Navigate } from 'react-router-dom'

const LoginAsPage = () => {
  const { data: user, isLoading: isUserLoading } = useApi('user', '/api/user', 'GET', null)
  if (isUserLoading) {
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
