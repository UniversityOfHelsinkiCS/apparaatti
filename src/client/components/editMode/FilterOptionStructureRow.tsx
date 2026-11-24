import { Paper, Stack, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { FilterOption, FilterOptionSettings } from '../../../common/types'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import BlackOutlinedButton from '../common/BlackOutlinedButton'

type FilterOptionStructureRowProps = {
  option: FilterOption
  draft: FilterOptionSettings | undefined
  isDeleted: boolean
  onChange: (change: Partial<FilterOptionSettings>) => void
  onDelete: () => void
}

const FilterOptionStructureRow = ({ option, draft, isDeleted, onChange, onDelete }: FilterOptionStructureRowProps) => {
  const { t } = useTranslation()
  const { isSuperuser } = useFilterEditMode()
  const optionId = draft?.id ?? option.id

  const row = (
    <Paper variant="outlined" sx={{ p: 2, opacity: isDeleted ? 0.5 : 1 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {option.name.fi}
          </Typography>
          <BlackOutlinedButton type="button" disabled={!isSuperuser} onClick={onDelete}>
            {isDeleted ? t('v2:filterSettings.undoDelete') : t('v2:filterSettings.deleteOption')}
          </BlackOutlinedButton>
        </Stack>
        {!isDeleted && (
          <TextField
            size="small"
            label={t('v2:filterSettings.optionId')}
            disabled={!isSuperuser}
            helperText={t('v2:filterSettings.optionIdWarning')}
            value={optionId}
            onChange={event => onChange({ id: event.target.value })}
          />
        )}
      </Stack>
    </Paper>
  )

  return row
}

export default FilterOptionStructureRow
