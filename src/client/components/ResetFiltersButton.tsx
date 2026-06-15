import { Typography } from '@mui/material'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFilterContext } from '../contexts/filterContext'
import DsButton from './common/DsButton'

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
      <ds-modal
        ds-open={open}
        ds-heading-text={t('v2:noRecommendations.resetConfirmationTitle')}
        ds-size="small"
        ondsModalClose={handleClose}
      >
        <div slot="content">
          <Typography>{t('v2:noRecommendations.resetConfirmationDescription')}</Typography>
        </div>
        <div slot="footer">
          <DsButton text={t('v2:noRecommendations.resetConfirmationCancel')} variant="secondary" onClick={handleClose} />
          <DsButton
            text={t('v2:noRecommendations.resetConfirmationConfirm')}
            variant="primary"
            onClick={handleConfirm}
          />
        </div>
      </ds-modal>
    </>
  )
}

export default ResetFiltersButton
