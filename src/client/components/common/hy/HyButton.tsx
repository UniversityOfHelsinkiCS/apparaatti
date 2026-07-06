import { styled, type SxProps } from '@mui/material/styles'
import type { ButtonHTMLAttributes } from 'react'

import { HOVER_MEDIA, hy } from './hyTokens'

type ButtonVariant = 'primary' | 'secondary' | 'supplementary'
type ButtonColour = 'blue' | 'black' | 'white' | 'danger'
type ButtonSize = 'medium' | 'small'

export interface HyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  colour?: ButtonColour
  size?: ButtonSize
  fullWidth?: boolean
  sx?: SxProps
}

interface StyledProps {
  $variant: ButtonVariant
  $colour: ButtonColour
  $size: ButtonSize
  $fullWidth: boolean
}

const FOCUS_RING_LIGHT = {
  '&:focus-visible': {
    boxShadow: `0 0 0 2px ${hy.borderColor.white}`,
    outline: `2px solid ${hy.borderColor.black}`,
    outlineOffset: '2px',
  },
}

const FOCUS_RING_DARK = {
  '&:focus-visible': {
    boxShadow: `0 0 0 2px ${hy.borderColor.black}`,
    outline: `2px solid ${hy.borderColor.white}`,
    outlineOffset: '2px',
  },
}

function getVariantColorStyles(variant: ButtonVariant, colour: ButtonColour) {
  const focusRing = colour === 'white' ? FOCUS_RING_DARK : FOCUS_RING_LIGHT

  if (variant === 'primary') {
    const config = {
      blue: {
        bg: hy.bgColor.primary,
        text: hy.textColor.white,
        hover: hy.bgColor.primaryHover,
        active: hy.bgColor.primaryActive,
        disBg: hy.bgColor.disabledOnLight,
        disText: hy.textColor.disabledOnLight,
      },
      black: {
        bg: hy.bgColor.black,
        text: hy.textColor.white,
        hover: hy.bgColor.blackHover,
        active: hy.bgColor.blackActive,
        disBg: hy.bgColor.disabledOnLight,
        disText: hy.textColor.disabledOnLight,
      },
      white: {
        bg: hy.bgColor.white,
        text: hy.textColor.default,
        hover: hy.bgColor.whiteHover,
        active: hy.bgColor.whiteActive,
        disBg: hy.bgColor.disabledOnDark,
        disText: hy.textColor.disabledOnDark,
      },
      danger: {
        bg: hy.bgColor.dangerBold,
        text: hy.textColor.white,
        hover: hy.bgColor.dangerBoldHover,
        active: hy.bgColor.dangerBoldActive,
        disBg: hy.bgColor.disabledOnLight,
        disText: hy.textColor.disabledOnLight,
      },
    }[colour]

    return {
      backgroundColor: config.bg,
      borderColor: 'transparent',
      color: config.text,
      [HOVER_MEDIA]: { '&:hover:not(:disabled)': { backgroundColor: config.hover } },
      '&:active:not(:disabled)': { backgroundColor: config.active },
      '&:disabled': { backgroundColor: config.disBg, borderColor: 'transparent', color: config.disText },
      ...focusRing,
    }
  }

  if (variant === 'secondary') {
    const config = {
      blue: {
        border: hy.borderColor.primary,
        text: hy.textColor.primary,
        hover: hy.bgColor.secondaryHover,
        active: hy.bgColor.secondaryActive,
        disBorder: hy.borderColor.disabledOnLight,
        disText: hy.textColor.disabledOnLight,
      },
      black: {
        border: hy.borderColor.black,
        text: hy.textColor.default,
        hover: hy.bgColor.transparentOnLightHover,
        active: hy.bgColor.transparentOnLightActive,
        disBorder: hy.borderColor.disabledOnLight,
        disText: hy.textColor.disabledOnLight,
      },
      white: {
        border: hy.borderColor.white,
        text: hy.textColor.white,
        hover: hy.bgColor.transparentOnDarkHover,
        active: hy.bgColor.transparentOnDarkActive,
        disBorder: hy.borderColor.disabledOnDark,
        disText: hy.textColor.disabledOnDark,
      },
      danger: {
        border: hy.borderColor.danger,
        text: hy.textColor.danger,
        hover: hy.bgColor.danger,
        active: hy.bgColor.dangerHover,
        disBorder: hy.borderColor.disabledOnLight,
        disText: hy.textColor.disabledOnLight,
      },
    }[colour]

    return {
      backgroundColor: 'transparent',
      borderColor: config.border,
      color: config.text,
      [HOVER_MEDIA]: { '&:hover:not(:disabled)': { backgroundColor: config.hover } },
      '&:active:not(:disabled)': { backgroundColor: config.active },
      '&:disabled': { backgroundColor: 'transparent', borderColor: config.disBorder, color: config.disText },
      ...focusRing,
    }
  }

  // supplementary
  const config = {
    blue: {
      text: hy.textColor.primary,
      hover: hy.bgColor.secondaryHover,
      active: hy.bgColor.secondaryActive,
      disText: hy.textColor.disabledOnLight,
    },
    black: {
      text: hy.textColor.default,
      hover: hy.bgColor.transparentOnLightHover,
      active: hy.bgColor.transparentOnLightActive,
      disText: hy.textColor.disabledOnLight,
    },
    white: {
      text: hy.textColor.white,
      hover: hy.bgColor.transparentOnDarkHover,
      active: hy.bgColor.transparentOnDarkActive,
      disText: hy.textColor.disabledOnDark,
    },
    danger: {
      text: hy.textColor.danger,
      hover: hy.bgColor.danger,
      active: hy.bgColor.dangerHover,
      disText: hy.textColor.disabledOnLight,
    },
  }[colour]

  return {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: config.text,
    [HOVER_MEDIA]: { '&:hover:not(:disabled)': { backgroundColor: config.hover } },
    '&:active:not(:disabled)': { backgroundColor: config.active },
    '&:disabled': { backgroundColor: 'transparent', borderColor: 'transparent', color: config.disText },
    ...focusRing,
  }
}

const StyledButton = styled('button', {
  shouldForwardProp: prop => prop !== '$variant' && prop !== '$colour' && prop !== '$size' && prop !== '$fullWidth',
})<StyledProps>(({ $variant, $colour, $size, $fullWidth }) => [
  {
    boxSizing: 'border-box',
    display: $fullWidth ? 'flex' : 'inline-flex',
    width: $fullWidth ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    borderStyle: 'solid',
    fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    '&:disabled': { cursor: 'not-allowed' },
    textTransform: 'none',
    outline: '4px solid transparent',
    fontSize: $size === 'small' ? '16px' : '18px',
    lineHeight: $size === 'small' ? 1.5 : undefined,
    letterSpacing: $size === 'small' ? '0px' : undefined,
    minHeight: $size === 'small' ? '2rem' : '2.75rem',
    paddingTop: $size === 'small' ? '0.125rem' : '0.25rem',
    paddingBottom: $size === 'small' ? '0.125rem' : '0.25rem',
    paddingLeft: $variant === 'supplementary' ? '0.125rem' : $size === 'small' ? '0.5rem' : '0.75rem',
    paddingRight: $variant === 'supplementary' ? '0.125rem' : $size === 'small' ? '0.5rem' : '0.75rem',
    borderWidth: $variant === 'secondary' ? '2px' : '0px',
  },
  getVariantColorStyles($variant, $colour),
])

const HyButton = ({
  variant = 'primary',
  colour = 'blue',
  size = 'medium',
  fullWidth = false,
  sx,
  ...props
}: HyButtonProps) => (
  <StyledButton $variant={variant} $colour={colour} $size={size} $fullWidth={fullWidth} sx={sx} {...props} />
)

export default HyButton
