import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useRequiredUser from '../../util/useRequiredUser.ts'
import AdminNavbar from './AdminNavbar.tsx'
import BackendLocalesEditor from './BackendLocalesEditor.tsx'

const BackendLocalesPage = () => {
  const { t } = useTranslation()
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading) {
    return <div>{t('v2:admin.loading')}</div>
  }

  if (!user) {
    return <div>{t('v2:admin.loading')}</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser={user.isSuperuser === true} />
      <BackendLocalesEditor isSuperuser={user.isSuperuser === true} />
    </Box>
  )
}

export default BackendLocalesPage
