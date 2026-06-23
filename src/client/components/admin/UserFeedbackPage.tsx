import {
  Box,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { toDayLabel } from '../../../common/datelabels.ts'
import type { RecommendationMetadata } from '../../../common/types.ts'
import { useFeedbackDeletion } from '../../hooks/useFeedbackDeletion.ts'
import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useApi from '../../util/useApi.tsx'
import useRequiredUser from '../../util/useRequiredUser.ts'
import ActionButton from '../common/ActionButton.tsx'
import AutoCompleteTextField from '../common/AutoCompleteTextField.tsx'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import HyCheckbox from '../common/hy/HyCheckbox.tsx'
import AdminNavbar from './AdminNavbar.tsx'
import DeleteConfirmDialog from './DeleteConfirmDialog.tsx'
import FeedbackCommentDialog from './FeedbackCommentDialog.tsx'
import MassActionDialog from './FeedbackDeletionControls.tsx'

type UserFeedback = {
  id: number
  textFeedback: string
  stars: number
  date: string
  recommendationMetadata?: RecommendationMetadata | null
  appVersion?: string | null
  email?: string | null
}

type EmailFilterValue = 'all' | 'has-email' | 'no-email'

const truncateFeedback = (text: string, maxLength = 140) => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}

const getDefaultStart = () => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 1)
  return toDayLabel(date)
}

const getDefaultEnd = () => toDayLabel(new Date())

const UserFeedbackPage = () => {
  const { t } = useTranslation()
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null)
  const [massActionOpen, setMassActionOpen] = useState(false)
  const [start, setStart] = useState(getDefaultStart)
  const [end, setEnd] = useState(getDefaultEnd)
  const [emailFilter, setEmailFilter] = useState<EmailFilterValue>('all')
  const [emailSearch, setEmailSearch] = useState('')
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const startDateTime = `${start}T00:00:00.000Z`
  const endDateTime = `${end}T23:59:59.999Z`
  const endpoint = `/api/admin/user-feedback?start=${encodeURIComponent(startDateTime)}&end=${encodeURIComponent(endDateTime)}`

  const { data, isLoading, refetch } = useApi<UserFeedback[]>(`admin-user-feedback-${start}-${end}`, endpoint, 'GET')

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading || !user) {
    return <div>Loading...</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  const feedbackRows = Array.isArray(data) ? data : []

  const emailOptions = Array.from(new Set(feedbackRows.map(f => f.email).filter((e): e is string => Boolean(e))))

  const filteredRows = feedbackRows.filter(f => {
    if (emailFilter === 'has-email' && !f.email) return false
    if (emailFilter === 'no-email' && f.email) return false
    if (emailSearch && (!f.email || !f.email.toLowerCase().includes(emailSearch.toLowerCase()))) return false
    return true
  })

  const {
    selectedIds,
    allFilteredSelected,
    someFilteredSelected,
    toggleRow,
    toggleAll,
    olderThanDate,
    setOlderThanDate,
    deleteTarget,
    clearDeleteTarget,
    handleDeleteSelected,
    handleDeleteOlderThan,
    handleConfirmDelete,
    snackbar,
    closeSnackbar,
  } = useFeedbackDeletion(feedbackRows, filteredRows, refetch)

  const olderThanCount = olderThanDate
    ? feedbackRows.filter(f => new Date(f.date) < new Date(`${olderThanDate}T23:59:59.999Z`)).length
    : null

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser={user.isSuperuser === true} />
      <Typography variant="h4" sx={{ mb: 2 }}>
        {t('v2:feedback.admin.pageTitle')}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
        <BlackOutlinedButton size="small" onClick={() => setMassActionOpen(true)}>
          {t('v2:feedback.admin.massAction')}
        </BlackOutlinedButton>
        {someFilteredSelected && (
          <Button variant="outlined" color="error" size="small" onClick={handleDeleteSelected}>
            {t('v2:feedback.admin.deleteSelected', { count: selectedIds.size })}
          </Button>
        )}
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
        <TextField
          label={t('v2:feedback.admin.start')}
          type="date"
          value={start}
          onChange={event => setStart(event.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <TextField
          label={t('v2:feedback.admin.end')}
          type="date"
          value={end}
          onChange={event => setEnd(event.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
        />
        <BlackOutlinedButton
          size="small"
          onClick={() => {
            setStart(getDefaultStart())
            setEnd(getDefaultEnd())
          }}
        >
          {t('v2:feedback.admin.last12Months')}
        </BlackOutlinedButton>
        <TextField
          select
          label={t('v2:feedback.admin.emailFilterLabel')}
          value={emailFilter}
          onChange={event => setEmailFilter(event.target.value as EmailFilterValue)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">{t('v2:feedback.admin.emailFilterAll')}</MenuItem>
          <MenuItem value="has-email">{t('v2:feedback.admin.emailFilterHas')}</MenuItem>
          <MenuItem value="no-email">{t('v2:feedback.admin.emailFilterNo')}</MenuItem>
        </TextField>
        <AutoCompleteTextField
          id="email-search"
          value={emailSearch}
          onChange={setEmailSearch}
          options={emailOptions}
          label={t('v2:feedback.admin.emailSearchLabel')}
          sx={{ minWidth: 260 }}
          size="small"
        />
      </Stack>

      <MassActionDialog
        open={massActionOpen}
        onClose={() => setMassActionOpen(false)}
        olderThanDate={olderThanDate}
        onOlderThanDateChange={setOlderThanDate}
        olderThanCount={olderThanCount}
        onDeleteOlderThan={handleDeleteOlderThan}
      />

      {isLoading ? (
        <Typography>{t('v2:feedback.admin.loading')}</Typography>
      ) : feedbackRows.length === 0 ? (
        <Typography>{t('v2:feedback.admin.empty')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <HyCheckbox
                    indeterminate={someFilteredSelected && !allFilteredSelected}
                    checked={allFilteredSelected}
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell>{t('v2:feedback.admin.table.date')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.stars')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.version')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.email')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.text')}</TableCell>
                <TableCell>{t('v2:feedback.admin.table.action')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map(feedback => (
                <TableRow key={feedback.id} selected={selectedIds.has(feedback.id)}>
                  <TableCell padding="checkbox">
                    <HyCheckbox checked={selectedIds.has(feedback.id)} onChange={() => toggleRow(feedback.id)} />
                  </TableCell>
                  <TableCell>{new Date(feedback.date).toLocaleString()}</TableCell>
                  <TableCell>{t('v2:feedback.admin.starsValue', { stars: feedback.stars })}</TableCell>
                  <TableCell>{feedback.appVersion ?? '—'}</TableCell>
                  <TableCell>{feedback.email ?? '—'}</TableCell>
                  <TableCell sx={{ maxWidth: 520 }}>
                    <Typography sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {truncateFeedback(feedback.textFeedback)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <ActionButton
                      text={t('v2:feedback.admin.readComment')}
                      type="button"
                      onClick={() => setSelectedFeedback(feedback)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FeedbackCommentDialog feedback={selectedFeedback} onClose={() => setSelectedFeedback(null)} />

      <DeleteConfirmDialog target={deleteTarget} onClose={clearDeleteTarget} onConfirm={handleConfirmDelete} />

      <Snackbar open={snackbar.open} message={snackbar.message} autoHideDuration={5000} onClose={closeSnackbar} />
    </Box>
  )
}

export default UserFeedbackPage
