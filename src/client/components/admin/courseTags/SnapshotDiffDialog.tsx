import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { TagPayloadDiff } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

interface SnapshotDiffDialogProps {
  diff: TagPayloadDiff | null
  onClose: () => void
}

const SnapshotDiffDialog = ({ diff, onClose }: SnapshotDiffDialogProps) => {
  const { t } = useTranslation()

  const isUnchanged =
    diff !== null &&
    diff.addedTags.length === 0 &&
    diff.removedTags.length === 0 &&
    diff.addedCuTags.length === 0 &&
    diff.removedCuTags.length === 0 &&
    diff.addedCurTags.length === 0 &&
    diff.removedCurTags.length === 0

  return (
    <Dialog open={diff !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('v2:courseTags.snapshots.diffTitle')}</DialogTitle>
      <DialogContent>
        {isUnchanged ? (
          <Typography>{t('v2:courseTags.snapshots.diffUnchanged')}</Typography>
        ) : (
          <Stack spacing={1}>
            <Typography>
              {t('v2:courseTags.snapshots.diffTagsAdded', { count: diff?.addedTags.length ?? 0 })}
            </Typography>
            <Typography>
              {t('v2:courseTags.snapshots.diffTagsRemoved', { count: diff?.removedTags.length ?? 0 })}
            </Typography>
            <Typography>
              {t('v2:courseTags.snapshots.diffCuAdded', { count: diff?.addedCuTags.length ?? 0 })}
            </Typography>
            <Typography>
              {t('v2:courseTags.snapshots.diffCuRemoved', { count: diff?.removedCuTags.length ?? 0 })}
            </Typography>
            <Typography>
              {t('v2:courseTags.snapshots.diffCurAdded', { count: diff?.addedCurTags.length ?? 0 })}
            </Typography>
            <Typography>
              {t('v2:courseTags.snapshots.diffCurRemoved', { count: diff?.removedCurTags.length ?? 0 })}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onClose}>
          {t('v2:courseTags.close')}
        </BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )
}

export default SnapshotDiffDialog
