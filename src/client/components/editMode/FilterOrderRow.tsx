import { FormControlLabel, IconButton, Paper, Stack, Switch, Typography } from '@mui/material'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { defaultVariant } from '../../../common/conditionMatching'
import type { FilterConfig, FilterSettingsPatch } from '../../../common/types'
import { SWITCH_SX } from '../admin/filterEdit/filterEditorUtils'

type FilterOrderRowProps = {
  filter: FilterConfig
  isFirst: boolean
  isLast: boolean
  isBusy: boolean
  onMove: (direction: 1 | -1) => void
  onToggleFlag: (patch: FilterSettingsPatch) => void
}

const FilterOrderRow = ({ filter, isFirst, isLast, isBusy, onMove, onToggleFlag }: FilterOrderRowProps) => {
  const { t } = useTranslation()

  const toggle = (label: string, checked: boolean, onChange: (next: boolean) => void) => (
    <FormControlLabel
      labelPlacement="top"
      label={
        <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
          {label}
        </Typography>
      }
      sx={{ m: 0 }}
      control={
        <Switch
          checked={checked}
          disabled={isBusy}
          sx={SWITCH_SX}
          slotProps={{ input: { 'aria-label': label } }}
          onChange={event => onChange(event.target.checked)}
        />
      }
    />
  )

  return (
    <Paper variant="outlined" data-testid={`filter-order-row-${filter.id}`} sx={{ p: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
        <IconButton
          size="small"
          disabled={isFirst || isBusy}
          aria-label={t('v2:filterSettings.moveUp', { filter: filter.id })}
          onClick={() => onMove(-1)}
        >
          <ChevronUp />
        </IconButton>
        <IconButton
          size="small"
          disabled={isLast || isBusy}
          aria-label={t('v2:filterSettings.moveDown', { filter: filter.id })}
          onClick={() => onMove(1)}
        >
          <ChevronDown />
        </IconButton>
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {defaultVariant(filter.variants)?.shortName?.fi || filter.shortName.fi || filter.id}
        </Typography>
        {toggle(t('v2:filterSettings.flag.enabled'), filter.enabled, next => onToggleFlag({ enabled: next }))}
        {toggle(t('v2:filterSettings.inWelcomeModal'), filter.showInWelcomeModal, next =>
          onToggleFlag({ showInWelcomeModal: next })
        )}
        {toggle(t('v2:filterSettings.inSidebar'), !filter.hideInFilterSidebar, next =>
          onToggleFlag({ hideInFilterSidebar: !next })
        )}
      </Stack>
    </Paper>
  )
}

export default FilterOrderRow
