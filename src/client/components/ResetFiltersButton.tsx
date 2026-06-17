import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFilterContext } from '../contexts/filterContext'
import BlackContainedButton from './common/BlackContainedButton'
import BlackOutlinedButton from './common/BlackOutlinedButton'

type Props = {
  children: (props: { label: string; openDialog: () => void }) => ReactNode
}

const ResetFiltersButton = ({ children }: Props) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { resetFilters } = useFilterContext()

  const handleClose = () => {
    setOpen(false)
  }

  const handleConfirm = () => {
    resetFilters()
    handleClose()
  }

  return (
    <>
      {children({
        label: t('v2:noRecommendations.resetButton'),
        openDialog: () => setOpen(true),
      })}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>{t('v2:noRecommendations.resetConfirmationTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('v2:noRecommendations.resetConfirmationDescription')}</Typography>
        </DialogContent>
        <DialogActions>
          <BlackOutlinedButton onClick={handleClose}>
            {t('v2:noRecommendations.resetConfirmationCancel')}
          </BlackOutlinedButton>
          <BlackContainedButton onClick={handleConfirm}>
            {t('v2:noRecommendations.resetConfirmationConfirm')}
          </BlackContainedButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ResetFiltersButton
