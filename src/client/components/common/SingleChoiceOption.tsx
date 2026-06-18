import { FormControlLabel } from '@mui/material'

import { Option } from '../../../common/types'
import HyBadge from './hy/HyBadge'
import HyRadio from './hy/HyRadio'

interface SingleChoiceOptionProps {
  option: Option
  filterId: string
  count?: number | null
}

const SingleChoiceOption = ({ option, filterId, count }: SingleChoiceOptionProps) => {
  const label =
    count != null ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {option.name}
        <HyBadge variant={count === 0 ? 'disabled' : 'default'}>{count}</HyBadge>
      </span>
    ) : (
      option.name
    )
  return (
    <FormControlLabel
      value={option.id}
      disabled={count === 0}
      data-cy={`${filterId}-option-${option.id}`}
      control={<HyRadio />}
      label={label}
      sx={{
        py: '2px',
        // overriding negative margin because MUI default marginLeft: -11px looks bad
        marginLeft: '-8px',
        opacity: count === 0 ? 0.4 : 1,
        cursor: 'default',
      }}
    />
  )
}

export default SingleChoiceOption
