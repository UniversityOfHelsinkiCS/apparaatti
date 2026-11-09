import { Alert, Paper, Snackbar, Stack, Typography } from '@mui/material'
import { Settings } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { describeVariantQuery } from '../../../common/conditionMatching'
import type { FilterSnapshotMeta } from '../../../common/types'
import { useFilterContext } from '../../contexts/filterContext'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import useApi from '../../util/useApi'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import HyIconButton from '../common/hy/HyIconButton'
import ExitEditModeDialog from './ExitEditModeDialog'
import HiddenFilterWordingsDialog from './HiddenFilterWordingsDialog'
import WordingEditPopover from './WordingEditPopover'

const FilterEditModeOverlay = () => {
  const { t } = useTranslation()
  const { isEditMode, editingVersionId, exitEditMode, savedField, clearSaved } = useFilterEditMode()
  const [isHiddenOpen, setIsHiddenOpen] = useState(false)
  const [isExitOpen, setIsExitOpen] = useState(false)
  const filterContext = useFilterContext()
  const { data: snapshots } = useApi<FilterSnapshotMeta[]>(
    'filter-snapshots',
    '/api/admin/filter-config/snapshots',
    'GET'
  )

  if (!isEditMode) {
    return null
  }

  const version = (snapshots ?? []).find(snapshot => snapshot.id === editingVersionId)
  const variantId = describeVariantQuery(filterContext.variantQuery)

  const overlay = (
    <>
      <Paper
        elevation={6}
        data-testid="filter-edit-mode-overlay"
        sx={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1300, p: 2, maxWidth: 360 }}
      >
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="subtitle2">{t('v2:filterWordings.overlay.title')}</Typography>
            <HyIconButton onClick={() => setIsHiddenOpen(true)} aria-label={t('v2:filterWordings.hidden.open')}>
              <Settings />
            </HyIconButton>
          </Stack>
          <Typography variant="body2">
            {t('v2:filterWordings.overlay.version', { name: version?.name ?? String(editingVersionId) })}
          </Typography>
          <Typography variant="body2">{t('v2:filterWordings.overlay.variant', { variant: variantId })}</Typography>
          <Typography variant="caption">{t('v2:filterWordings.overlay.hint')}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <BlackOutlinedButton type="button" onClick={() => setIsExitOpen(true)}>
              {t('v2:filterWordings.overlay.exit')}
            </BlackOutlinedButton>
            <BlackOutlinedButton href="/admin">{t('v2:filterWordings.overlay.backToAdmin')}</BlackOutlinedButton>
          </Stack>
        </Stack>
      </Paper>
      <HiddenFilterWordingsDialog open={isHiddenOpen} onClose={() => setIsHiddenOpen(false)} />
      <ExitEditModeDialog
        open={isExitOpen}
        versionId={editingVersionId}
        versionName={version?.name ?? String(editingVersionId)}
        onClose={() => setIsExitOpen(false)}
        onConfirm={() => {
          setIsExitOpen(false)
          exitEditMode()
        }}
      />
      <Snackbar
        open={savedField !== null}
        autoHideDuration={3000}
        onClose={clearSaved}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert severity="success" onClose={clearSaved} variant="filled">
          {t('v2:filterWordings.saved', {
            field: savedField ? t(`v2:filterWordings.field.${savedField}`) : '',
          })}
        </Alert>
      </Snackbar>
      <WordingEditPopover />
    </>
  )

  return overlay
}

export default FilterEditModeOverlay
