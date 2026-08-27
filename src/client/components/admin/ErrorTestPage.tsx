import { Alert, Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import useApiMutation from '../../hooks/useApiMutation.tsx'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useRequiredUser from '../../util/useRequiredUser.ts'
import BlackContainedButton from '../common/BlackContainedButton.tsx'
import AdminNavbar from './AdminNavbar.tsx'

const ErrorTestPage = () => {
  const { t } = useTranslation()
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const [notice, setNotice] = useState<string | null>(null)

  const { mutateAsync: causeBackendError } = useApiMutation<Record<string, never>>(async res => {
    if (res.ok) {
      setNotice(t('v2:admin.errorTest.backendOk'))
      return
    }
    setNotice(t('v2:admin.errorTest.backendTriggered', { status: res.status }))
  }, '/api/admin/debug/cause-error')

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading || !user) {
    return <div>{t('v2:admin.loading')}</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  if (!user.isSuperuser) {
    return <Navigate to={'/admin'} replace />
  }

  const handleFrontendError = () => {
    setNotice(t('v2:admin.errorTest.frontendTriggered'))
    setTimeout(() => {
      throw new Error(`Test error triggered from the admin error test page by ${user.username}`)
    }, 0)
  }

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser />

      <Typography variant="h4" sx={{ mb: 1 }}>
        {t('v2:admin.errorTest.pageTitle')}
      </Typography>

      <Typography sx={{ mb: 3 }}>{t('v2:admin.errorTest.description')}</Typography>

      {notice && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap>
        <BlackContainedButton onClick={() => void causeBackendError({})}>
          {t('v2:admin.errorTest.causeBackend')}
        </BlackContainedButton>
        <BlackContainedButton onClick={handleFrontendError}>
          {t('v2:admin.errorTest.causeFrontend')}
        </BlackContainedButton>
      </Stack>
    </Box>
  )
}

export default ErrorTestPage
