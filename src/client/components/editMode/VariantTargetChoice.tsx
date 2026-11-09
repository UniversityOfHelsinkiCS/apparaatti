import { Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../common/BlackOutlinedButton'

interface VariantTargetChoiceProps {
  variantName: string
  onPick: (createVariant: boolean) => void
}

const VariantTargetChoice = ({ variantName, onPick }: VariantTargetChoiceProps) => {
  const { t } = useTranslation()

  const choice = (
    <Stack spacing={1.5}>
      <Typography variant="body2">{t('v2:filterWordings.choice.description', { variant: variantName })}</Typography>
      <BlackOutlinedButton type="button" onClick={() => onPick(false)}>
        {t('v2:filterWordings.choice.editDefault')}
      </BlackOutlinedButton>
      <BlackOutlinedButton type="button" onClick={() => onPick(true)}>
        {t('v2:filterWordings.choice.createVariant', { variant: variantName })}
      </BlackOutlinedButton>
    </Stack>
  )

  return choice
}

export default VariantTargetChoice
