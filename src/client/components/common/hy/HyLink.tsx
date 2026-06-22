import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { styled, type SxProps } from '@mui/material/styles'

import { hy } from './hyTokens'

type LinkSize = '2xLarge' | 'xLarge' | 'large' | 'medium' | 'small' | 'xSmall'
type LinkVariant = 'inline' | 'standalone'
type LinkWeight = 'regular' | 'semibold' | 'bold'
type LinkColour = 'black' | 'white'

interface HyLinkProps {
  href?: string
  target?: string
  rel?: string
  variant?: LinkVariant
  weight?: LinkWeight
  size?: LinkSize
  colour?: LinkColour
  icon?: React.ReactElement
  iconPosition?: 'start' | 'end'
  'aria-label'?: string
  children: React.ReactNode
  sx?: SxProps
}

type OwnerState = {
  variant: LinkVariant
  weight: LinkWeight
  size?: LinkSize
  colour?: LinkColour
}

const fontWeightMap: Record<LinkWeight, number> = {
  regular: 400,
  semibold: 600,
  bold: 700,
}

const fontSizeMap: Record<LinkSize, number> = {
  '2xLarge': 22,
  xLarge: 20,
  large: 18,
  medium: 16,
  small: 14,
  xSmall: 12,
}

const iconSizeMap: Record<LinkSize, string> = {
  '2xLarge': '1.375rem',
  xLarge: '1.25rem',
  large: '1.125rem',
  medium: '1rem',
  small: '0.875rem',
  xSmall: '0.75rem',
}

const VisuallyHidden = styled('span')({
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
})

const IconSpan = styled('span')<{
  ownerState: { variant: LinkVariant; iconPosition: 'start' | 'end'; size?: LinkSize }
}>(({ ownerState }) => {
  const { variant, iconPosition, size } = ownerState
  const isEnd = iconPosition === 'end'
  const margin = variant === 'standalone' ? '0.5rem' : '0.25rem'
  const iconSize = size ? iconSizeMap[size] : '1rem'

  return {
    display: 'inline-block',
    verticalAlign: '-0.125em',
    ...(isEnd ? { marginLeft: margin } : { marginRight: margin }),
    '& .MuiSvgIcon-root': {
      fontSize: iconSize,
    },
  }
})

const Root = styled('a')<{ ownerState: OwnerState }>(({ ownerState }) => {
  const { variant, weight, size, colour } = ownerState
  const isStandalone = variant === 'standalone'

  const colorDefault =
    colour === 'white' ? hy.textColor.white : colour === 'black' ? hy.textColor.default : hy.textColor.link
  const colorHover = colour ? colorDefault : hy.textColor.linkHover
  const colorActive = colour ? colorDefault : hy.textColor.linkActive
  const colorVisited = colour ? colorDefault : hy.textColor.linkVisited
  const colorFocusStandalone = colour ? colorDefault : hy.textColor.link

  return {
    boxSizing: 'border-box',
    display: isStandalone ? 'inline-flex' : 'inline',
    alignItems: isStandalone ? 'center' : undefined,
    color: colorDefault,
    fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
    fontWeight: fontWeightMap[weight],
    letterSpacing: 0,
    lineHeight: 1.5,
    textDecorationLine: isStandalone ? 'none' : 'underline',
    textDecorationStyle: 'solid',
    textDecorationSkipInk: 'auto',
    textDecorationThickness: '7%',
    textUnderlineOffset: '12%',
    textUnderlinePosition: 'from-font',
    ...(size && { fontSize: fontSizeMap[size] }),

    '&:hover, &:active': {
      textDecorationLine: 'underline',
      textDecorationThickness: '13%',
      textUnderlineOffset: '12%',
    },

    '&:hover': {
      color: colorHover,
    },

    '&:active': {
      color: colorActive,
    },

    '&:visited': {
      color: colorVisited,
    },

    '&:focus-visible': {
      ...(isStandalone && { color: colorFocusStandalone }),
      boxShadow: `0 0 0 2px ${hy.borderColor.white}`,
      outline: `2px solid ${hy.borderColor.black}`,
      outlineOffset: '2px',
    },
  }
})

const HyLink = ({
  href,
  target,
  rel,
  variant = 'inline',
  weight = 'regular',
  size,
  colour,
  icon,
  iconPosition = 'end',
  'aria-label': ariaLabel,
  children,
  sx,
}: HyLinkProps) => {
  const opensNewTab = target === '_blank'
  const effectiveRel = opensNewTab ? (rel ? `${rel} noopener noreferrer` : 'noopener noreferrer') : rel
  const ownerState: OwnerState = { variant, weight, size, colour }

  const renderIcon = (pos: 'start' | 'end', el: React.ReactElement) => (
    <IconSpan ownerState={{ variant, iconPosition: pos, size }}>{el}</IconSpan>
  )

  const startIcon = icon && iconPosition === 'start' ? renderIcon('start', icon) : null

  let endIcon: React.ReactElement | null = null
  if (opensNewTab) {
    endIcon = renderIcon('end', <OpenInNewIcon />)
  } else if (icon && iconPosition === 'end') {
    endIcon = renderIcon('end', icon)
  }

  return (
    <Root ownerState={ownerState} href={href} target={target} rel={effectiveRel} aria-label={ariaLabel} sx={sx}>
      {startIcon}
      {children}
      {endIcon}
      {opensNewTab && <VisuallyHidden>, opens in a new tab</VisuallyHidden>}
    </Root>
  )
}

export default HyLink
