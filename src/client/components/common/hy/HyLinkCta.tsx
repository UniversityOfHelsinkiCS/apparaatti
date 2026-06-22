import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { styled, type SxProps } from '@mui/material/styles'

import { hy } from './hyTokens'

type Variant = 'primary' | 'secondary' | 'supplementary'
type Colour = 'blue' | 'black' | 'white'
type Size = 'medium' | 'small'

interface HyLinkCtaProps {
  href?: string
  target?: string
  rel?: string
  variant?: Variant
  colour?: Colour
  size?: Size
  hideIcon?: boolean
  iconPosition?: 'start' | 'end'
  disabled?: boolean
  'aria-label'?: string
  children: React.ReactNode
  sx?: SxProps
}

type OwnerState = { variant: Variant; colour: Colour; size: Size }

function focusRing(colour: Colour) {
  return colour === 'white'
    ? {
        boxShadow: `0 0 0 2px ${hy.borderColor.black}`,
        outline: `2px solid ${hy.borderColor.white}`,
        outlineOffset: 2,
      }
    : {
        boxShadow: `0 0 0 2px ${hy.borderColor.white}`,
        outline: `2px solid ${hy.borderColor.black}`,
        outlineOffset: 2,
      }
}

function variantColorStyles(variant: Variant, colour: Colour) {
  const focus = { '&:focus-visible': focusRing(colour) }

  if (variant === 'primary') {
    const map: Record<Colour, { bg: string; text: string; hover: string; active: string }> = {
      blue: {
        bg: hy.bgColor.primary,
        text: hy.textColor.white,
        hover: hy.bgColor.primaryHover,
        active: hy.bgColor.primaryActive,
      },
      black: {
        bg: hy.bgColor.black,
        text: hy.textColor.white,
        hover: hy.bgColor.blackHover,
        active: hy.bgColor.blackActive,
      },
      white: {
        bg: hy.bgColor.white,
        text: hy.textColor.default,
        hover: hy.bgColor.whiteHover,
        active: hy.bgColor.whiteActive,
      },
    }
    const { bg, text, hover, active } = map[colour]
    return {
      backgroundColor: bg,
      borderColor: 'transparent',
      color: text,
      '&:hover': { backgroundColor: hover },
      '&:active': { backgroundColor: active },
      ...focus,
    }
  }

  if (variant === 'secondary') {
    const map: Record<Colour, { borderColor: string; text: string; hover: string; active: string }> = {
      blue: {
        borderColor: hy.borderColor.primary,
        text: hy.textColor.primary,
        hover: hy.bgColor.secondaryHover,
        active: hy.bgColor.secondaryActive,
      },
      black: {
        borderColor: hy.borderColor.black,
        text: hy.textColor.default,
        hover: hy.bgColor.transparentOnLightHover,
        active: hy.bgColor.transparentOnLightActive,
      },
      white: {
        borderColor: hy.borderColor.white,
        text: hy.textColor.white,
        hover: hy.bgColor.transparentOnDarkHover,
        active: hy.bgColor.transparentOnDarkActive,
      },
    }
    const { borderColor, text, hover, active } = map[colour]
    return {
      backgroundColor: 'transparent',
      borderColor,
      color: text,
      '&:hover': { backgroundColor: hover },
      '&:active': { backgroundColor: active },
      ...focus,
    }
  }

  // supplementary
  const map: Record<Colour, { text: string; hover: string; active: string }> = {
    blue: { text: hy.textColor.primary, hover: hy.bgColor.secondaryHover, active: hy.bgColor.secondaryActive },
    black: {
      text: hy.textColor.default,
      hover: hy.bgColor.transparentOnLightHover,
      active: hy.bgColor.transparentOnLightActive,
    },
    white: {
      text: hy.textColor.white,
      hover: hy.bgColor.transparentOnDarkHover,
      active: hy.bgColor.transparentOnDarkActive,
    },
  }
  const { text, hover, active } = map[colour]
  return {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: text,
    '&:hover': { backgroundColor: hover },
    '&:active': { backgroundColor: active },
    ...focus,
  }
}

const Root = styled('a')<{ ownerState: OwnerState }>(({ ownerState }) => {
  const { variant, colour, size } = ownerState
  const isMedium = size === 'medium'
  const isSecondary = variant === 'secondary'

  return {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    borderStyle: isSecondary ? 'solid' : 'none',
    borderWidth: isSecondary ? 2 : 0,
    fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
    fontSize: isMedium ? 18 : 16,
    fontWeight: 600,
    minHeight: isMedium ? '2.75rem' : '2rem',
    paddingBlock: isMedium ? '0.25rem' : '0.125rem',
    paddingInline: isMedium ? '0.75rem' : '0.5rem',
    cursor: 'pointer',
    userSelect: 'none',
    textDecoration: 'none',
    outline: '4px solid transparent',
    '&[aria-disabled="true"]': {
      cursor: 'default',
      pointerEvents: 'none',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      color: hy.textColor.disabledOnLight,
    },
    ...variantColorStyles(variant, colour),
  }
})

const Text = styled('span')({
  padding: '0 0.25rem',
  letterSpacing: 0,
  lineHeight: 1.5,
  textDecorationLine: 'underline',
  textDecorationStyle: 'solid',
  textDecorationSkipInk: 'auto',
  textDecorationThickness: '7%',
  textUnderlineOffset: '12%',
  textUnderlinePosition: 'from-font',
})

const IconWrapper = styled('span')<{ ownerState: { size: Size; position: 'start' | 'end' } }>(({ ownerState }) => ({
  display: 'inline-flex',
  flexShrink: 0,
  ...(ownerState.position === 'end'
    ? { marginLeft: '0.25rem', marginRight: 0 }
    : { marginRight: '0.25rem', marginLeft: 0 }),
  '& .MuiSvgIcon-root': {
    fontSize: ownerState.size === 'medium' ? '1.5rem' : '1.25rem',
  },
}))

const VisuallyHidden = styled('span')({
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
})

const HyLinkCta = ({
  href,
  target,
  rel,
  variant = 'primary',
  colour = 'blue',
  size = 'medium',
  hideIcon = false,
  iconPosition = 'end',
  disabled = false,
  'aria-label': ariaLabel,
  children,
  sx,
}: HyLinkCtaProps) => {
  const opensNewTab = target === '_blank'
  const effectiveRel = opensNewTab ? (rel ? `${rel} noopener noreferrer` : 'noopener noreferrer') : rel
  const IconComponent = opensNewTab ? ArrowOutwardIcon : ArrowForwardIcon

  const iconEl = !hideIcon && (
    <IconWrapper ownerState={{ size, position: iconPosition }}>
      <IconComponent />
    </IconWrapper>
  )

  return (
    <Root
      ownerState={{ variant, colour, size }}
      sx={sx}
      href={href}
      target={target}
      rel={effectiveRel}
      aria-disabled={disabled ? 'true' : undefined}
      aria-label={ariaLabel}
    >
      {iconPosition === 'start' && iconEl}
      <Text>{children}</Text>
      {iconPosition === 'end' && iconEl}
      {opensNewTab && <VisuallyHidden>, opens in a new tab</VisuallyHidden>}
    </Root>
  )
}

export default HyLinkCta
