import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import SnapshotMetaFields from './SnapshotMetaFields.tsx'

interface NewVersionDialogProps {
  open: boolean
  isBusy: boolean
  onClose: () => void
  onCreate: (name: string, description: string | null) => void
}

const NewVersionDialog = ({ open, isBusy, onClose, onCreate }: NewVersionDialogProps) => {
  const { t } = useTranslation()
  const metaRef = useRef({ name: '', description: '' })

  const handleMetaChange = useCallback((meta: { name: string; description: string }) => {
    metaRef.current = meta
  }, [])

  const handleCreate = () => {
    const name = metaRef.current.name.trim() || `${new Date().toISOString().replace('T', ' ').slice(0, 16)}`
    onCreate(name, metaRef.current.description.trim() || null)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('v2:courseTags.editing.newTitle')}</DialogTitle>
      <DialogContent>
        <SnapshotMetaFields key={open ? 'open' : 'closed'} initialName="" onChange={handleMetaChange} />
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onClose} disabled={isBusy}>
          {t('v2:courseTags.cancel')}
        </BlackOutlinedButton>
        <BlackOutlinedButton type="button" onClick={handleCreate} disabled={isBusy}>
          {t('v2:courseTags.editing.newConfirm')}
        </BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )
}

export default NewVersionDialog
