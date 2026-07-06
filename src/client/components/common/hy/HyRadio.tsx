import type { RadioProps } from '@mui/material/Radio'
import Radio from '@mui/material/Radio'
import { styled } from '@mui/material/styles'

import { HOVER_MEDIA, hy } from './hyTokens'

const RadioIcon = styled('span')({
  boxSizing: 'border-box',
  width: 22,
  height: 22,
  borderRadius: '50%',
  border: `2px solid ${hy.borderColor.default}`,
  backgroundColor: hy.bgColor.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  [HOVER_MEDIA]: {
    'input:not(:disabled):hover ~ &': {
      backgroundColor: hy.bgColor.whiteHover,
    },
  },
  'input:not(:disabled):active ~ &': {
    backgroundColor: hy.bgColor.whiteActive,
  },
  'input:disabled ~ &': {
    borderColor: hy.borderColor.disabledOnLight,
    backgroundColor: hy.bgColor.disabledOnLight,
  },
  '.Mui-focusVisible &': {
    boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
    outline: `2px solid ${hy.bgColor.black}`,
    outlineOffset: '1px',
  },
})

const RadioCheckedIcon = styled(RadioIcon)({
  borderColor: hy.borderColor.primary,
  '&::before': {
    content: '""',
    display: 'block',
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: hy.bgColor.primary,
  },
  [HOVER_MEDIA]: {
    'input:not(:disabled):hover ~ &': {
      backgroundColor: hy.bgColor.white,
      borderColor: hy.bgColor.primaryHover,
      '&::before': {
        backgroundColor: hy.bgColor.primaryHover,
      },
    },
  },
  'input:not(:disabled):active ~ &': {
    backgroundColor: hy.bgColor.white,
    borderColor: hy.bgColor.primaryActive,
    '&::before': {
      backgroundColor: hy.bgColor.primaryActive,
    },
  },
  'input:disabled ~ &': {
    '&::before': {
      backgroundColor: hy.bgColor.disabledOnLight,
    },
  },
})

const HyRadio = ({ sx, ...props }: RadioProps) => (
  <Radio
    {...props}
    icon={<RadioIcon />}
    checkedIcon={<RadioCheckedIcon />}
    disableRipple
    sx={[
      {
        cursor: 'default',
        '&:hover': { backgroundColor: 'transparent' },
        '& .MuiTouchRipple-root': { display: 'none' },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
)

export default HyRadio
