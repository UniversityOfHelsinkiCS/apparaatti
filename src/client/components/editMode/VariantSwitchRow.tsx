import { Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { describeVariantQuery, type VariantQuery } from '../../../common/conditionMatching'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import ChangeVariantDialog from './ChangeVariantDialog'

/** "Muokattava variantti: …" for the whole page, with a button that changes the page answers. */
const VariantSwitchRow = ({ variantQuery }: { variantQuery: VariantQuery }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="body2">
          {t('v2:filterWordings.overlay.variant', { variant: describeVariantQuery(variantQuery) })}
        </Typography>
        <BlackOutlinedButton
          type="button"
          size="small"
          onClick={() => setIsOpen(true)}
          data-testid="change-variant-button"
        >
          {t('v2:filterWordings.changeVariant.open')}
        </BlackOutlinedButton>
      </Stack>
      {isOpen && <ChangeVariantDialog onClose={() => setIsOpen(false)} />}
    </>
  )
}

export default VariantSwitchRow
