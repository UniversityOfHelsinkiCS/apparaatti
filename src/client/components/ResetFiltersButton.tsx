import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFilterContext } from '../contexts/filterContext'

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
          <Button onClick={handleClose} sx={{ color: 'black' }}>
            {t('v2:noRecommendations.resetConfirmationCancel')}
          </Button>
          <Button variant="contained" color="secondary" onClick={handleConfirm}>
            {t('v2:noRecommendations.resetConfirmationConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ResetFiltersButton
