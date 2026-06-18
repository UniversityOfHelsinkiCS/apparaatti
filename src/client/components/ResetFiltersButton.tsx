import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFilterContext } from '../contexts/filterContext'
import BlackContainedButton from './common/BlackContainedButton'
import BlackOutlinedButton from './common/BlackOutlinedButton'
import HyButton from './common/hy/HyButton'

const ResetFiltersButton = () => {
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
      <HyButton variant="supplementary" colour="blue" onClick={() => setOpen(true)}>
        {t('v2:noRecommendations.resetButton')}
      </HyButton>

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
