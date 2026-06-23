import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import { toDayLabel } from '../../../common/datelabels.ts'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'

const get180DaysAgo = () => {
  const date = new Date()
  date.setDate(date.getDate() - 180)
  return toDayLabel(date)
}

type MassActionDialogProps = {
  open: boolean
  onClose: () => void
  olderThanDate: string
  onOlderThanDateChange: (date: string) => void
  olderThanCount: number | null
  onDeleteOlderThan: () => void
}

const MassActionDialog = ({
  open,
  onClose,
  olderThanDate,
  onOlderThanDateChange,
  olderThanCount,
  onDeleteOlderThan,
}: MassActionDialogProps) => {
  const { t } = useTranslation()

  const handleDeleteOlderThan = () => {
    onClose()
    onDeleteOlderThan()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('v2:feedback.admin.massAction')}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {t('v2:feedback.admin.deleteOlderThanLabel')}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <TextField
                type="date"
                value={olderThanDate}
                onChange={event => onOlderThanDateChange(event.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <BlackOutlinedButton size="small" onClick={() => onOlderThanDateChange(get180DaysAgo())}>
                {t('v2:feedback.admin.prefill180Days')}
              </BlackOutlinedButton>
            </Stack>
            {olderThanCount !== null && (
              <Typography variant="body2" color={olderThanCount === 0 ? 'text.disabled' : 'error'}>
                {t('v2:feedback.admin.deleteOlderThanPreview', { count: olderThanCount })}
              </Typography>
            )}
            <Box>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleDeleteOlderThan}
                disabled={!olderThanDate || olderThanCount === 0}
              >
                {t('v2:feedback.admin.deleteOlderThanButton')}
              </Button>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose}>{t('v2:feedback.admin.close')}</BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )
}

export default MassActionDialog
