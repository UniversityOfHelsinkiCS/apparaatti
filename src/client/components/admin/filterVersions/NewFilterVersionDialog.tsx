import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import FilterVersionMetaFields from './FilterVersionMetaFields.tsx'

interface NewFilterVersionDialogProps {
  open: boolean
  isBusy: boolean
  onClose: () => void
  onCreate: (name: string, description: string | null) => void
}

const NewFilterVersionDialog = ({ open, isBusy, onClose, onCreate }: NewFilterVersionDialogProps) => {
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
      <DialogTitle>{t('v2:filterVersions.newTitle')}</DialogTitle>
      <DialogContent>
        <FilterVersionMetaFields key={open ? 'open' : 'closed'} initialName="" onChange={handleMetaChange} />
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onClose} disabled={isBusy}>
          {t('v2:filterVersions.cancel')}
        </BlackOutlinedButton>
        <BlackOutlinedButton type="button" onClick={handleCreate} disabled={isBusy}>
          {t('v2:filterVersions.newConfirm')}
        </BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )
}

export default NewFilterVersionDialog
