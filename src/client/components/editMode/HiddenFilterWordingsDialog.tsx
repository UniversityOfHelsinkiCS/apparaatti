import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { describeVariantQuery } from '../../../common/conditionMatching'
import type { Question } from '../../../common/types'
import { useFilterContext } from '../../contexts/filterContext'
import { resolveVariant } from '../../hooks/useQuestions'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import HiddenFilterWordingRow from './HiddenFilterWordingRow'

type HiddenReason = 'hiddenInSidebar' | 'welcomeModalOnly' | 'variantSkipped' | 'noVariant'

const hiddenReason = (filter: Question, isSkipped: boolean, hasVariant: boolean): HiddenReason | null => {
  if (!hasVariant) return 'noVariant'
  if (isSkipped) return 'variantSkipped'
  if (filter.hideInFilterSidebar && filter.showInWelcomeModal) return 'welcomeModalOnly'
  if (filter.hideInFilterSidebar) return 'hiddenInSidebar'
  return null
}

interface HiddenFilterWordingsDialogProps {
  open: boolean
  onClose: () => void
}

const HiddenFilterWordingsDialog = ({ open, onClose }: HiddenFilterWordingsDialogProps) => {
  const { t } = useTranslation()
  const filterContext = useFilterContext()
  const { variantQuery } = filterContext
  const variantId = describeVariantQuery(variantQuery)

  const hidden = filterContext.filters
    .map((filter: Question) => {
      const { variant, isFallback } = resolveVariant(filter, variantQuery)
      const reason = hiddenReason(filter, Boolean(variant?.skipped), Boolean(variant))
      return { filter, variant, isFallback, reason }
    })
    .filter(entry => entry.reason !== null)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t('v2:filterWordings.hidden.title')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('v2:filterWordings.hidden.description', { variant: variantId })}
        </Typography>
        <Stack spacing={2}>
          {hidden.length === 0 && <Typography variant="body2">{t('v2:filterWordings.hidden.empty')}</Typography>}
          {hidden.map(entry => (
            <HiddenFilterWordingRow
              key={entry.filter.id}
              filter={entry.filter}
              variant={entry.variant}
              variantName={entry.variant?.name ?? variantId}
              isFallbackVariant={entry.isFallback}
              variantQuery={variantQuery}
              reason={entry.reason as HiddenReason}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onClose}>
          {t('v2:filterWordings.hidden.close')}
        </BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )
}

export default HiddenFilterWordingsDialog
