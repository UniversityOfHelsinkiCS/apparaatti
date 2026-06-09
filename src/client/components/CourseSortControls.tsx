import { Stack, ToggleButtonGroup, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import SortButton from './common/SortButton'

export type SortMode = 'recommended' | 'name' | 'period'
export type SortDirection = 'asc' | 'desc'

interface CourseSortControlsProps {
  sortMode: SortMode
  sortDirection: SortDirection
  onChange: (mode: SortMode) => void
  onDirectionChange: (direction: SortDirection) => void
}

const CourseSortControls = ({ sortMode, sortDirection, onChange, onDirectionChange }: CourseSortControlsProps) => {
  const { t } = useTranslation()

  const handleModeChange = (_: React.MouseEvent, value: SortMode | null) => {
    if (value === null) {
      // re-clicked the active button — flip direction (only for non-recommended)
      if (sortMode !== 'recommended') {
        onDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')
      }
      return
    }
    onChange(value)
  }

  const arrow = sortDirection === 'asc' ? ' ↑' : ' ↓'

  const buttons: { value: SortMode; label: string; flippable: boolean }[] = [
    { value: 'recommended', label: t('v2:sortRecommended'), flippable: false },
    { value: 'name', label: t('v2:sortName'), flippable: true },
    { value: 'period', label: t('v2:sortPeriod'), flippable: true },
  ]

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, pt: 2, flexWrap: 'wrap', gap: 1 }}>
      <Typography variant="body2" sx={{ color: '#475569' }}>
        {t('v2:sortBy')}:
      </Typography>
      <ToggleButtonGroup value={sortMode} exclusive size="small" onChange={handleModeChange}>
        {buttons.map(({ value, label, flippable }) => (
          <SortButton
            key={value}
            value={value}
            label={label}
            arrow={arrow}
            active={sortMode === value}
            flippable={flippable}
          />
        ))}
      </ToggleButtonGroup>
    </Stack>
  )
}

export default CourseSortControls
