import Checkbox from '@mui/material/Checkbox'
import type { CheckboxProps } from '@mui/material/Checkbox'
import { CHECKBOX_COLOR, CHECKBOX_SX } from './checkboxStyles.ts'

const AppCheckbox = ({ sx, ...props }: CheckboxProps) => {
  const mergedSx = Array.isArray(sx)
    ? [CHECKBOX_SX, ...sx]
    : [CHECKBOX_SX, sx]

  return <Checkbox {...props} color={CHECKBOX_COLOR} sx={mergedSx} />
}

export default AppCheckbox