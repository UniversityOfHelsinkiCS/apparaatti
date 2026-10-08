import { Box, Divider, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { UrnMatchMode } from '../../../common/types.ts'
import { hy } from '../common/hy/hyTokens.ts'
import MultiAutoCompleteTextField from '../common/MultiAutoCompleteTextField.tsx'

const fieldsetSx = {
  display: 'flex',
  gap: 1,
  alignItems: 'center',
  border: '1px solid',
  borderColor: 'rgba(0,0,0,0.23)',
  borderRadius: 1,
  px: 1.5,
  py: 1,
  m: 0,
} as const
const legendSx = { px: 0.5, fontWeight: 600, fontSize: 12 } as const

// A single filter (the value field plus its own mode toggle) is grouped in
// its own bordered box so it is obvious which field the OR/AND toggle controls.
const groupSx = {
  display: 'flex',
  gap: 0.5,
  alignItems: 'center',
  border: '1px solid',
  borderColor: 'rgba(0,0,0,0.23)',
  borderRadius: 1,
  px: 1,
  py: 1,
  m: 0,
} as const
const groupLegendSx = { px: 0.5, fontWeight: 600, fontSize: 11 } as const

interface MatchModeToggleProps {
  id: string
  value: UrnMatchMode
  onChange: (mode: UrnMatchMode) => void
  orTitle: string
  andTitle: string
}

const MatchModeToggle = ({ id, value, onChange, orTitle, andTitle }: MatchModeToggleProps) => (
  <ToggleButtonGroup
    id={id}
    exclusive
    size="small"
    value={value}
    onChange={(_event, newMode: UrnMatchMode | null) => {
      if (newMode) onChange(newMode)
    }}
  >
    <Tooltip title={orTitle}>
      <ToggleButton value="or">OR</ToggleButton>
    </Tooltip>
    <Tooltip title={andTitle}>
      <ToggleButton value="and">AND</ToggleButton>
    </Tooltip>
  </ToggleButtonGroup>
)

export interface FilterFieldsetLabels {
  legend: string
  include: string
  exclude: string
  includeOrTitle: string
  includeAndTitle: string
  excludeOrTitle: string
  excludeAndTitle: string
}

interface FilterFieldsetProps {
  idPrefix: string
  options: string[]
  labels: FilterFieldsetLabels
  includeValues: string[]
  includeMode: UrnMatchMode
  excludeValues: string[]
  excludeMode: UrnMatchMode
  onIncludeChange: (values: string[]) => void
  onIncludeModeChange: (mode: UrnMatchMode) => void
  onExcludeChange: (values: string[]) => void
  onExcludeModeChange: (mode: UrnMatchMode) => void
}

const FilterFieldset = ({
  idPrefix,
  options,
  labels,
  includeValues,
  includeMode,
  excludeValues,
  excludeMode,
  onIncludeChange,
  onIncludeModeChange,
  onExcludeChange,
  onExcludeModeChange,
}: FilterFieldsetProps) => {
  const { t } = useTranslation()

  return (
    <Box component="fieldset" sx={fieldsetSx}>
      <Typography component="legend" sx={legendSx}>
        {labels.legend}
      </Typography>
      <Box component="fieldset" sx={groupSx}>
        <Typography component="legend" sx={groupLegendSx}>
          {t('v2:admin.courses.search.includeLegend')}
        </Typography>
        <MultiAutoCompleteTextField
          id={`${idPrefix}-include`}
          value={includeValues}
          onChange={onIncludeChange}
          options={options}
          label={labels.include}
          sx={{
            minWidth: 300,
            ...(includeValues.length > 0 && { '& .MuiOutlinedInput-root': { backgroundColor: hy.bgColor.success } }),
          }}
        />
        <MatchModeToggle
          id={`${idPrefix}-include-mode`}
          value={includeMode}
          onChange={onIncludeModeChange}
          orTitle={labels.includeOrTitle}
          andTitle={labels.includeAndTitle}
        />
      </Box>

      <Divider orientation="vertical" flexItem />

      <Box component="fieldset" sx={groupSx}>
        <Typography component="legend" sx={groupLegendSx}>
          {t('v2:admin.courses.search.excludeLegend')}
        </Typography>
        <MultiAutoCompleteTextField
          id={`${idPrefix}-exclude`}
          value={excludeValues}
          onChange={onExcludeChange}
          options={options}
          label={labels.exclude}
          sx={{
            minWidth: 300,
            ...(excludeValues.length > 0 && { '& .MuiOutlinedInput-root': { backgroundColor: hy.bgColor.danger } }),
          }}
        />
        <MatchModeToggle
          id={`${idPrefix}-exclude-mode`}
          value={excludeMode}
          onChange={onExcludeModeChange}
          orTitle={labels.excludeOrTitle}
          andTitle={labels.excludeAndTitle}
        />
      </Box>
    </Box>
  )
}

export default FilterFieldset
