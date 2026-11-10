import { Box, Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { LoginFailure } from '../util/redirectToLogin'
import { redirectToLogin } from '../util/redirectToLogin'
import BlackContainedButton from './common/BlackContainedButton'
import { hy } from './common/hy/hyTokens'

const LoginFailedPage = ({ reason }: { reason: LoginFailure }) => {
  const { t } = useTranslation()

  const page = (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: hy.bgColor.neutral,
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 520 }}>
        <Stack spacing={2}>
          <Typography variant="h5" component="h1">
            {t('v2:login.failedTitle')}
          </Typography>
          <Typography variant="body1">{t(`v2:login.${reason}Description`)}</Typography>
          <Box>
            <BlackContainedButton type="button" onClick={redirectToLogin}>
              {t('v2:login.tryAgain')}
            </BlackContainedButton>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )

  return page
}

export default LoginFailedPage
