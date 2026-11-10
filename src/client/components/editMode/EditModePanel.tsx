import { Paper, Stack, Typography } from '@mui/material'
import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useFilterContext } from '../../contexts/filterContext'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import HyIconButton from '../common/hy/HyIconButton'
import VariantSwitchRow from './VariantSwitchRow'

type EditModePanelProps = {
  versionName: string
  onOpenHiddenWordings: () => void
  onExit: () => void
}

/** The box fixed to the bottom right while edit mode is on. */
const EditModePanel = ({ versionName, onOpenHiddenWordings, onExit }: EditModePanelProps) => {
  const { t } = useTranslation()
  const { variantQuery } = useFilterContext()

  return (
    <Paper
      elevation={6}
      data-testid="filter-edit-mode-overlay"
      sx={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1300, p: 2, maxWidth: 360 }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle2">{t('v2:filterWordings.overlay.title')}</Typography>
          <HyIconButton onClick={onOpenHiddenWordings} aria-label={t('v2:filterWordings.hidden.open')}>
            <Settings />
          </HyIconButton>
        </Stack>
        <Typography variant="body2">{t('v2:filterWordings.overlay.version', { name: versionName })}</Typography>
        <VariantSwitchRow variantQuery={variantQuery} />
        <Typography variant="caption">{t('v2:filterWordings.overlay.hint')}</Typography>
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <BlackOutlinedButton type="button" onClick={onExit}>
            {t('v2:filterWordings.overlay.exit')}
          </BlackOutlinedButton>
          <BlackOutlinedButton href="/admin">{t('v2:filterWordings.overlay.backToAdmin')}</BlackOutlinedButton>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default EditModePanel
