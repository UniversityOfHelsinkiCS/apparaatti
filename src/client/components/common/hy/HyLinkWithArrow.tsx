import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import { styled, type SxProps, type Theme } from '@mui/material/styles'

import { hy } from './hyColors'

type HyLinkIcon = 'arrow_forward' | 'arrow_back' | 'arrow_outward'
type HyIconPosition = 'start' | 'end'

interface HyLinkWithArrowProps {
  href?: string
  target?: string
  rel?: string
  icon?: HyLinkIcon
  iconPosition?: HyIconPosition
  fullWidth?: boolean
  children: React.ReactNode
  sx?: SxProps<Theme>
}

const ICON_CLASS = 'HyLinkWithArrow-icon'

const Root = styled('a')<{ ownerState: { fullWidth: boolean } }>(({ ownerState }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  color: hy.textColor.link,
  letterSpacing: 0,
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  fontWeight: 600,
  fontSize: 16,
  textDecorationLine: 'none',
  ...(ownerState.fullWidth && {
    width: '100%',
    justifyContent: 'space-between',
  }),
  '@media (min-width: 30rem)': {
    fontSize: 18,
  },
  '&:hover, &:active': {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationSkipInk: 'auto',
    textDecorationThickness: '7%',
    textUnderlineOffset: '12%',
    textUnderlinePosition: 'from-font',
  },
  '&:hover': {
    color: hy.textColor.linkHover,
    [`& .${ICON_CLASS}`]: {
      backgroundColor: hy.bgColor.primaryHover,
    },
  },
  '&:active': {
    color: hy.textColor.linkActive,
    [`& .${ICON_CLASS}`]: {
      backgroundColor: hy.bgColor.primaryActive,
    },
  },
  '&:focus-visible': {
    color: hy.textColor.linkActive,
    boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
    outline: `2px solid ${hy.bgColor.black}`,
    outlineOffset: '2px',
  },
}))

const IconBox = styled('span')<{ ownerState: { position: HyIconPosition } }>(({ ownerState }) => ({
  display: 'inline-flex',
  flexShrink: 0,
  width: '2rem',
  height: '2rem',
  lineHeight: 0,
  alignItems: 'center',
  justifyContent: 'center',
  color: hy.textColor.white,
  backgroundColor: hy.bgColor.primary,
  ...(ownerState.position === 'start' ? { marginRight: '0.75rem' } : { marginLeft: '0.75rem' }),
  '@media (min-width: 30rem)': {
    width: '2.5rem',
    height: '2.5rem',
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

const iconSizeSx = {
  fontSize: '1.5rem',
  '@media (min-width: 30rem)': { fontSize: '2rem' },
}

const iconMap: Record<HyLinkIcon, React.ReactElement> = {
  arrow_forward: <ArrowForwardIcon sx={iconSizeSx} />,
  arrow_back: <ArrowBackIcon sx={iconSizeSx} />,
  arrow_outward: <ArrowOutwardIcon sx={iconSizeSx} />,
}

const HyLinkWithArrow = ({
  href,
  target,
  rel,
  icon = 'arrow_forward',
  iconPosition = 'start',
  fullWidth = false,
  children,
  sx,
}: HyLinkWithArrowProps) => {
  const opensNewTab = target === '_blank'
  const effectiveIcon = opensNewTab ? 'arrow_outward' : icon
  const effectiveRel = opensNewTab ? 'noopener noreferrer' : rel

  const iconEl = (
    <IconBox className={ICON_CLASS} ownerState={{ position: iconPosition }}>
      {iconMap[effectiveIcon]}
    </IconBox>
  )

  return (
    <Root ownerState={{ fullWidth }} href={href} target={target} rel={effectiveRel} sx={sx}>
      {iconPosition === 'start' && iconEl}
      {children}
      {iconPosition === 'end' && iconEl}
      {opensNewTab && <VisuallyHidden>, opens in a new tab</VisuallyHidden>}
    </Root>
  )
}

export default HyLinkWithArrow
