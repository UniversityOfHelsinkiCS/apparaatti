import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import FilterDiffList from '../admin/filterVersions/FilterDiffList'
import { fetchFilterPublishDiff } from '../admin/filterVersions/filterSnapshotApi'
import BlackContainedButton from '../common/BlackContainedButton'
import BlackOutlinedButton from '../common/BlackOutlinedButton'

interface ExitEditModeDialogProps {
  open: boolean
  versionId: number | null
  versionName: string
  onClose: () => void
  onConfirm: () => void
}

const ExitEditModeDialog = ({ open, versionId, versionName, onClose, onConfirm }: ExitEditModeDialogProps) => {
  const { t } = useTranslation()

  const { data: diff } = useQuery({
    queryKey: ['filter-publish-diff', versionId],
    queryFn: () => fetchFilterPublishDiff(versionId as number),
    enabled: open && versionId !== null,
  })

  const dialog = (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t('v2:filterWordings.exit.title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('v2:filterWordings.exit.description', { name: versionName })}
        </Typography>
        <FilterDiffList diff={open ? (diff ?? null) : null} />
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onClose}>
          {t('v2:filterWordings.exit.stay')}
        </BlackOutlinedButton>
        <BlackContainedButton type="button" onClick={onConfirm}>
          {t('v2:filterWordings.exit.confirm')}
        </BlackContainedButton>
      </DialogActions>
    </Dialog>
  )

  return dialog
}

export default ExitEditModeDialog
