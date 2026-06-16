import FormControlLabel from '@mui/material/FormControlLabel'
import type { CheckboxProps } from '@mui/material/Checkbox'
import type { ReactNode } from 'react'
import HyCheckbox from './hy/HyCheckbox'

type LabeledCheckboxProps = {
  label: ReactNode
} & CheckboxProps

const LabeledCheckbox = ({ label, ...checkboxProps }: LabeledCheckboxProps) => {
  return <FormControlLabel control={<HyCheckbox {...checkboxProps} />} label={label} />
}

export default LabeledCheckbox
