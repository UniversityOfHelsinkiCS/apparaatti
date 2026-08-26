import { Alert, Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import useApiMutation from '../../hooks/useApiMutation.tsx'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useRequiredUser from '../../util/useRequiredUser.ts'
import BlackContainedButton from '../common/BlackContainedButton.tsx'
import AdminNavbar from './AdminNavbar.tsx'

const ErrorTestPage = () => {
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const [notice, setNotice] = useState<string | null>(null)

  const { mutateAsync: causeBackendError } = useApiMutation<Record<string, never>>(async res => {
    if (res.ok) {
      setNotice('Backend responded successfully — no error was triggered.')
      return
    }
    setNotice(`Backend error triggered (status ${res.status}).`)
  }, '/api/admin/debug/cause-error')

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading || !user) {
    return <div>Loading...</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  if (!user.isSuperuser) {
    return <Navigate to={'/admin'} replace />
  }

  const handleFrontendError = () => {
    setNotice('Frontend error thrown.')
    setTimeout(() => {
      throw new Error(`Test error triggered from the admin error test page by ${user.username}`)
    }, 0)
  }

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser />

      <Typography variant="h4" sx={{ mb: 1 }}>
        Error test
      </Typography>

      <Typography sx={{ mb: 3 }}>
        Trigger a deliberate error to verify that error reporting works. Errors are only sent to Sentry in production.
      </Typography>

      {notice && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap>
        <BlackContainedButton onClick={() => void causeBackendError({})}>Cause error in backend</BlackContainedButton>
        <BlackContainedButton onClick={handleFrontendError}>Cause error in frontend</BlackContainedButton>
      </Stack>
    </Box>
  )
}

export default ErrorTestPage
