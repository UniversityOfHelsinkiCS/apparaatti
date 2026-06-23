import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { DeleteTarget } from '../../hooks/useFeedbackDeletion.ts'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'

type DeleteConfirmDialogProps = {
  target: DeleteTarget | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

const DeleteConfirmDialog = ({ target, onClose, onConfirm }: DeleteConfirmDialogProps) => {
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    await onConfirm()
    setIsDeleting(false)
  }

  return (
    <Dialog open={target !== null} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('v2:feedback.admin.confirmDeleteTitle')}</DialogTitle>
      <DialogContent>
        <Typography>{t('v2:feedback.admin.confirmDeleteBody', { count: target?.count ?? 0 })}</Typography>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton onClick={onClose} disabled={isDeleting}>
          {t('v2:feedback.admin.close')}
        </BlackOutlinedButton>
        <Button variant="contained" color="error" onClick={handleConfirm} disabled={isDeleting}>
          {t('v2:feedback.admin.confirmDeleteButton')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteConfirmDialog
