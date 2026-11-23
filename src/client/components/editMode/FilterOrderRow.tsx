import { IconButton, Paper, Stack, Switch, Typography } from '@mui/material'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { FilterConfig } from '../../../common/types'
import { SWITCH_SX } from '../admin/filterEdit/filterEditorUtils'

type FilterOrderRowProps = {
  filter: FilterConfig
  isFirst: boolean
  isLast: boolean
  isBusy: boolean
  onMove: (direction: 1 | -1) => void
  onToggleEnabled: () => void
}

const FilterOrderRow = ({ filter, isFirst, isLast, isBusy, onMove, onToggleEnabled }: FilterOrderRowProps) => {
  const { t } = useTranslation()

  return (
    <Paper variant="outlined" sx={{ p: 1 }}>
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
          {filter.shortName.fi || filter.id}
        </Typography>
        <Switch
          checked={filter.enabled}
          disabled={isBusy}
          sx={SWITCH_SX}
          inputProps={{ 'aria-label': t('v2:filterSettings.flag.enabled') }}
          onChange={onToggleEnabled}
        />
      </Stack>
    </Paper>
  )
}

export default FilterOrderRow
