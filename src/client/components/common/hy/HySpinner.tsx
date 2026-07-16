import { keyframes, styled, type SxProps } from '@mui/material/styles'

import { hy } from './hyTokens'

type SpinnerSize = 'small' | 'medium' | 'large' | 'xLarge' | '2xLarge'
type SpinnerColour = 'blue' | 'black' | 'white' | 'danger'
type SpinnerTextPosition = 'below' | 'side'

interface HySpinnerProps {
  text?: string
  size?: SpinnerSize
  textPosition?: SpinnerTextPosition
  colour?: SpinnerColour
  hiddenAssistiveText?: string
  useRoleAlert?: boolean
  useAriaLive?: boolean
  sx?: SxProps
}

const SIZE_PX: Record<SpinnerSize, number> = {
  small: 10,
  medium: 14,
  large: 20,
  xLarge: 28,
  '2xLarge': 40,
}

const PADDING_PX: Record<SpinnerSize, number> = {
  small: 1.5,
  medium: 3,
  large: 3,
  xLarge: 5.5,
  '2xLarge': 5.5,
}

const TEXT_FONT_SIZE_PX: Record<SpinnerSize, number> = {
  small: hy.fontSize[12],
  medium: hy.fontSize[14],
  large: hy.fontSize[16],
  xLarge: hy.fontSize[18],
  '2xLarge': hy.fontSize[20],
}

const SPINNER_COLOUR: Record<SpinnerColour, string> = {
  blue: hy.bgColor.primary,
  black: hy.textColor.default,
  white: hy.bgColor.white,
  danger: hy.textColor.danger,
}

const rotate = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
})

const SpinnerRoot = styled('div')<{
  ownerState: { size: SpinnerSize; textPosition: SpinnerTextPosition; hasText: boolean }
}>(({ ownerState }) => ({
  display: 'inline-block',
  padding: PADDING_PX[ownerState.size],
  ...(ownerState.hasText && {
    display: 'inline-flex',
    alignItems: 'center',
    gap: SIZE_PX[ownerState.size] / 2,
    flexDirection: ownerState.textPosition === 'below' ? 'column' : 'row',
  }),
}))

const SpinnerCircle = styled('div')<{ ownerState: { size: SpinnerSize } }>(({ ownerState }) => {
  const sizePx = SIZE_PX[ownerState.size]
  return {
    width: sizePx,
    height: sizePx,
    borderRadius: '50%',
    border: `${sizePx / 6}px solid ${hy.borderColor.disabledOnLight}`,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
})

const SpinnerSegment = styled('div')<{
  ownerState: { size: SpinnerSize; colour: SpinnerColour; delay: number }
}>(({ ownerState }) => {
  const sizePx = SIZE_PX[ownerState.size]
  const spinnerColor = SPINNER_COLOUR[ownerState.colour]
  const sideColor = ownerState.colour === 'white' ? hy.bgColor.transparentOnDarkHover : 'transparent'
  return {
    display: 'block',
    position: 'absolute',
    width: sizePx,
    height: sizePx,
    borderRadius: '50%',
    borderWidth: sizePx / 6,
    borderStyle: 'solid',
    borderColor: `${spinnerColor} ${sideColor} ${sideColor} ${sideColor}`,
    animation: `${rotate} 1.1s cubic-bezier(0.7, 0.15, 0.3, 0.8) infinite`,
    animationDelay: `${ownerState.delay}s`,
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '2.2s',
      animationTimingFunction: 'linear',
      animationDelay: `${ownerState.delay * 2}s`,
    },
  }
})

const SpinnerText = styled('span')<{ ownerState: { size: SpinnerSize; colour: SpinnerColour } }>(({ ownerState }) => ({
  color: ownerState.colour === 'white' ? hy.textColor.white : hy.textColor.default,
  fontFamily: hy.fontFamily.body,
  fontSize: TEXT_FONT_SIZE_PX[ownerState.size],
  fontWeight: hy.fontWeight.regular,
}))

const VisuallyHidden = styled('span')({
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
})

const HySpinner = ({
  text,
  size = 'medium',
  textPosition = 'below',
  colour = 'blue',
  hiddenAssistiveText,
  useRoleAlert = false,
  useAriaLive = false,
  sx,
}: HySpinnerProps) => (
  <SpinnerRoot
    ownerState={{ size, textPosition, hasText: !!text }}
    role={useRoleAlert ? 'alert' : undefined}
    aria-live={useAriaLive ? 'polite' : undefined}
    sx={sx}
  >
    <SpinnerCircle ownerState={{ size }}>
      <SpinnerSegment ownerState={{ size, colour, delay: -0.3 }} />
      <SpinnerSegment ownerState={{ size, colour, delay: -0.2 }} />
      <SpinnerSegment ownerState={{ size, colour, delay: -0.1 }} />
    </SpinnerCircle>
    {hiddenAssistiveText && <VisuallyHidden>{hiddenAssistiveText}</VisuallyHidden>}
    {text && <SpinnerText ownerState={{ size, colour }}>{text}</SpinnerText>}
  </SpinnerRoot>
)

export default HySpinner
