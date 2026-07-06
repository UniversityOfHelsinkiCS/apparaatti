import type { CheckboxProps } from '@mui/material/Checkbox'
import Checkbox from '@mui/material/Checkbox'
import { styled } from '@mui/material/styles'

import { HOVER_MEDIA, hy } from './hyTokens'

const CHECKMARK = `url("data:image/svg+xml;charset=utf-8,<svg width='16' height='13' viewBox='0 0 16 13' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M5.99997 7.87871L13.606 0.272705L15.7273 2.39403L5.99997 12.1214L0.272644 6.39402L2.39396 4.27271L5.99997 7.87871Z' fill='%23ffffff' /></svg>")`
const CHECKMARK_DISABLED = `url("data:image/svg+xml;charset=utf-8,<svg width='16' height='13' viewBox='0 0 16 13' xmlns='http://www.w3.org/2000/svg'><path fill-rule='evenodd' clip-rule='evenodd' d='M5.99997 7.87871L13.606 0.272705L15.7273 2.39403L5.99997 12.1214L0.272644 6.39402L2.39396 4.27271L5.99997 7.87871Z' fill='%23999999' /></svg>")`
const INDETERMINATE = `url("data:image/svg+xml;charset=utf-8,<svg width='14' height='4' viewBox='0 0 14 4' xmlns='http://www.w3.org/2000/svg'><rect width='13.3333' height='3' transform='matrix(1 0 0 -1 0.333313 3.5)' fill='%23ffffff' /></svg>")`
const INDETERMINATE_DISABLED = `url("data:image/svg+xml;charset=utf-8,<svg width='14' height='4' viewBox='0 0 14 4' xmlns='http://www.w3.org/2000/svg'><rect width='13.3333' height='3' transform='matrix(1 0 0 -1 0.333313 3.5)' fill='%23999999' /></svg>")`

const CheckboxIcon = styled('span')({
  boxSizing: 'border-box',
  width: 24,
  height: 24,
  border: `2px solid ${hy.borderColor.default}`,
  backgroundColor: hy.bgColor.white,
  display: 'grid',
  placeContent: 'center',
  flexShrink: 0,
  [HOVER_MEDIA]: {
    'input:hover ~ &': {
      backgroundColor: hy.bgColor.whiteHover,
    },
  },
  'input:active ~ &': {
    backgroundColor: hy.bgColor.whiteActive,
  },
  'input:disabled ~ &': {
    borderColor: hy.borderColor.disabledOnLight,
    backgroundColor: hy.bgColor.disabledOnLight,
  },
  '.Mui-focusVisible &': {
    boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
    outline: `2px solid ${hy.bgColor.black}`,
    outlineOffset: '2px',
  },
})

const markBase = {
  content: '""',
  display: 'block',
  width: 16,
  height: 16,
  backgroundSize: 'contain' as const,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'center' as const,
}

const CheckboxCheckedIcon = styled(CheckboxIcon)({
  backgroundColor: hy.bgColor.primary,
  borderColor: 'transparent',
  '&::before': {
    ...markBase,
    backgroundImage: CHECKMARK,
  },
  [HOVER_MEDIA]: {
    'input:hover ~ &': {
      backgroundColor: hy.bgColor.primaryHover,
      borderColor: 'transparent',
    },
  },
  'input:active ~ &': {
    backgroundColor: hy.bgColor.primaryActive,
    borderColor: 'transparent',
  },
  'input:disabled ~ &': {
    backgroundColor: hy.bgColor.disabledOnLight,
    borderColor: 'transparent',
    '&::before': {
      backgroundImage: CHECKMARK_DISABLED,
    },
  },
})

const CheckboxIndeterminateIcon = styled(CheckboxIcon)({
  backgroundColor: hy.bgColor.primary,
  borderColor: 'transparent',
  '&::before': {
    ...markBase,
    backgroundImage: INDETERMINATE,
  },
  [HOVER_MEDIA]: {
    'input:hover ~ &': {
      backgroundColor: hy.bgColor.primaryHover,
      borderColor: 'transparent',
    },
  },
  'input:active ~ &': {
    backgroundColor: hy.bgColor.primaryActive,
    borderColor: 'transparent',
  },
  'input:disabled ~ &': {
    backgroundColor: hy.bgColor.disabledOnLight,
    borderColor: 'transparent',
    '&::before': {
      backgroundImage: INDETERMINATE_DISABLED,
    },
  },
})

const HyCheckbox = ({ sx, ...props }: CheckboxProps) => (
  <Checkbox
    {...props}
    icon={<CheckboxIcon />}
    checkedIcon={<CheckboxCheckedIcon />}
    indeterminateIcon={<CheckboxIndeterminateIcon />}
    disableRipple
    sx={[
      {
        cursor: 'default',
        '&:hover': { backgroundColor: 'transparent' },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
)

export default HyCheckbox
