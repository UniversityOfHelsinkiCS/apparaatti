import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFilterContext } from '../contexts/filterContext'
import HyButton from './common/hy/HyButton'
import HyModal from './common/hy/HyModal'

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

      <HyModal
        open={open}
        onClose={handleClose}
        size="small"
        title={t('v2:noRecommendations.resetConfirmationTitle')}
        footer={
          <HyButton variant="primary" colour="black" onClick={handleConfirm}>
            {t('v2:noRecommendations.resetConfirmationConfirm')}
          </HyButton>
        }
      >
        {t('v2:noRecommendations.resetConfirmationDescription')}
      </HyModal>
    </>
  )
}

export default ResetFiltersButton
