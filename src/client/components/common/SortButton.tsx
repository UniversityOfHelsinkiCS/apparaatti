import { ToggleButton } from '@mui/material'

import type { SortMode } from '../CourseSortControls'

interface SortButtonProps {
  value: SortMode
  label: string
  arrow: string
  active: boolean
  flippable: boolean
}

const SortButton = ({ value, label, arrow, active, flippable }: SortButtonProps) => (
  <ToggleButton value={value}>
    {label}
    {flippable && active ? arrow : ''}
  </ToggleButton>
)

export default SortButton
