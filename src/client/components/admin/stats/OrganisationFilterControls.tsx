import { Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

type OrganisationFilterControlsProps = {
  groupKeys: string[]
  hiddenOrganisations: string[]
  onChange: (hiddenOrganisations: string[]) => void
}

const OrganisationFilterControls = ({ groupKeys, hiddenOrganisations, onChange }: OrganisationFilterControlsProps) => {
  const { t } = useTranslation()
  const isEverythingHidden = groupKeys.length > 0 && groupKeys.every(groupKey => hiddenOrganisations.includes(groupKey))

  //the buttons are always rendered so that the row does not change height when the filters change
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, minHeight: 40 }}>
      <Typography variant="body2" color="text.secondary" noWrap>
        {t('v2:admin.stats.legendHint')}
      </Typography>
      <BlackOutlinedButton
        size="small"
        disabled={groupKeys.length === 0 || isEverythingHidden}
        onClick={() => onChange(groupKeys)}
      >
        {t('v2:admin.stats.hideAll')}
      </BlackOutlinedButton>
      <BlackOutlinedButton size="small" disabled={hiddenOrganisations.length === 0} onClick={() => onChange([])}>
        {t('v2:admin.stats.showAll')}
      </BlackOutlinedButton>
    </Stack>
  )
}

export default OrganisationFilterControls
