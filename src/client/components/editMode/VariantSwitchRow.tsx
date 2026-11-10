import { Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { describeVariantQuery, type VariantQuery } from '../../../common/conditionMatching'
import type { FilterVariant } from '../../../common/types'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import ChangeVariantDialog from './ChangeVariantDialog'

type VariantSwitchRowProps = {
  variantQuery: VariantQuery
  /** Existing variants of the edited filter, offered as quick picks in the dialog. */
  filterVariants?: FilterVariant[]
  hasUnsavedChanges?: boolean
  disabled?: boolean
  onApplied?: () => void
}

/** "Muokattava variantti: …" with a button that opens the change-variant dialog. */
const VariantSwitchRow = ({
  variantQuery,
  filterVariants,
  hasUnsavedChanges = false,
  disabled = false,
  onApplied,
}: VariantSwitchRowProps) => {
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
          disabled={disabled}
          data-testid="change-variant-button"
        >
          {t('v2:filterWordings.changeVariant.open')}
        </BlackOutlinedButton>
      </Stack>
      {isOpen && (
        <ChangeVariantDialog
          filterVariants={filterVariants}
          hasUnsavedChanges={hasUnsavedChanges}
          onClose={() => setIsOpen(false)}
          onApplied={onApplied}
        />
      )}
    </>
  )
}

export default VariantSwitchRow
