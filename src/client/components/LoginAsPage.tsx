import { Box } from '@mui/material'
import { Navigate } from 'react-router-dom'

import { useAdminUser } from './admin/AdminMain.tsx'
import AdminNavbar from './admin/AdminNavbar.tsx'
import LoginAs from './LoginAs.tsx'

const LoginAsPage = () => {
  const user = useAdminUser()

  const loginAs = localStorage.getItem('loginAsUser')
  if (loginAs) {
    if (window.confirm('leave loginas?')) {
      localStorage.removeItem('loginAsUser')
    }
  }

  if (user.isSuperuser !== true) {
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
