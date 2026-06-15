import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import AdminNavbar from './AdminNavbar.tsx'
import BlackContainedButton from '../common/BlackContainedButton.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import useApi from '../../util/useApi.tsx'
import useApiMutation from '../../hooks/useApiMutation.tsx'
import useRequiredUser from '../../util/useRequiredUser.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import type { UpdaterRun } from '../../../common/types.ts'

const POLL_INTERVAL_MS = 5000

const formatDuration = (startedAt: Date | string, finishedAt: Date | string | null) => {
  if (!finishedAt) return '—'
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

const statusColor = (status: string): 'default' | 'primary' | 'success' | 'error' => {
  if (status === 'running') return 'primary'
  if (status === 'success') return 'success'
  if (status === 'failed') return 'error'
  return 'default'
}

const UpdaterPage = () => {
  const { t } = useTranslation()
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)

  const {
    data,
    isLoading: isRunsLoading,
    refetch,
  } = useApi<UpdaterRun[]>('updater-runs', '/api/admin/updater/runs', 'GET')
  const runs = Array.isArray(data) ? data : []

  const hasRunningRun = runs.some(r => r.status === 'running')

  // Poll while a run is active
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (hasRunningRun) {
      if (!pollRef.current) {
        pollRef.current = setInterval(() => {
          void refetch()
        }, POLL_INTERVAL_MS)
      }
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [hasRunningRun, refetch])

  const { mutateAsync: triggerRun } = useApiMutation<Record<string, never>>(async res => {
    if (res.status === 409) {
      setNotice({ type: 'warning', message: t('v2:updater.alreadyRunning') })
      return
    }
    if (!res.ok) {
      setNotice({ type: 'error', message: t('v2:updater.runFailed') })
      return
    }
    setNotice({ type: 'success', message: t('v2:updater.runStarted') })
    void refetch()
  }, '/api/admin/updater/run')

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading || !user) {
    return <div>{t('v2:updater.loading')}</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  if (!user.isSuperuser) {
    return <Navigate to={'/admin'} replace />
  }

  const handleConfirm = async () => {
    setConfirmOpen(false)
    setNotice(null)
    await triggerRun({})
  }

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser />

      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('v2:updater.pageTitle')}
      </Typography>

      {notice && (
        <Alert severity={notice.type} sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice.message}
        </Alert>
      )}

      {hasRunningRun && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Chip label={t('v2:updater.status.running')} color="primary" size="small" sx={{ mr: 1 }} />
          {t('v2:updater.alreadyRunning')}
        </Alert>
      )}

      <BlackContainedButton onClick={() => setConfirmOpen(true)} disabled={hasRunningRun} sx={{ mb: 4 }}>
        {t('v2:updater.runButton')}
      </BlackContainedButton>

      <Typography variant="h6" sx={{ mb: 2 }}>
        {t('v2:updater.historyTitle')}
      </Typography>

      {isRunsLoading ? (
        <Typography>{t('v2:updater.loading')}</Typography>
      ) : runs.length === 0 ? (
        <Typography>{t('v2:updater.empty')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('v2:updater.table.id')}</TableCell>
                <TableCell>{t('v2:updater.table.status')}</TableCell>
                <TableCell>{t('v2:updater.table.triggeredBy')}</TableCell>
                <TableCell>{t('v2:updater.table.started')}</TableCell>
                <TableCell>{t('v2:updater.table.finished')}</TableCell>
                <TableCell>{t('v2:updater.table.duration')}</TableCell>
                <TableCell>{t('v2:updater.table.error')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {runs.map(run => (
                <TableRow key={run.id}>
                  <TableCell>{run.id}</TableCell>
                  <TableCell>
                    <Chip label={t(`v2:updater.status.${run.status}`)} color={statusColor(run.status)} size="small" />
                  </TableCell>
                  <TableCell>{run.triggeredBy ?? '—'}</TableCell>
                  <TableCell>{new Date(run.startedAt).toLocaleString()}</TableCell>
                  <TableCell>{run.finishedAt ? new Date(run.finishedAt).toLocaleString() : '—'}</TableCell>
                  <TableCell>{formatDuration(run.startedAt, run.finishedAt)}</TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    {run.error ? (
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.75rem' }}
                      >
                        {run.error}
                      </Typography>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('v2:updater.confirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('v2:updater.confirmBody')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <BlackOutlinedButton onClick={() => setConfirmOpen(false)}>
            {t('v2:updater.cancelButton')}
          </BlackOutlinedButton>
          <BlackContainedButton onClick={() => void handleConfirm()}>
            {t('v2:updater.confirmButton')}
          </BlackContainedButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UpdaterPage
