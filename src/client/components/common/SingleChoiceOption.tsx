import { FormControlLabel } from '@mui/material'

import { Option } from '../../../common/types'
import HyBadge from './hy/HyBadge'
import HyRadio from './hy/HyRadio'
import ShrinkwrapText from './ShrinkwrapText'

interface SingleChoiceOptionProps {
  option: Option
  filterId: string
  count?: number | null
}

const SingleChoiceOption = ({ option, filterId, count }: SingleChoiceOptionProps) => {
  const label =
    count != null ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShrinkwrapText>{option.name}</ShrinkwrapText>
        <HyBadge variant={count === 0 ? 'disabled' : 'default'}>{count}</HyBadge>
      </span>
    ) : (
      <ShrinkwrapText>{option.name}</ShrinkwrapText>
    )
  return (
    <FormControlLabel
      value={option.id}
      disabled={count === 0}
      data-testid={`${filterId}-option-${option.id}`}
      control={<HyRadio />}
      label={label}
      sx={{
        py: '2px',
        // overriding weird MUI default negative margin stuff
        marginLeft: '-4px',
        marginRight: '4px',
        opacity: count === 0 ? 0.5 : 1,
        cursor: 'default',
      }}
    />
  )
}

export default SingleChoiceOption
