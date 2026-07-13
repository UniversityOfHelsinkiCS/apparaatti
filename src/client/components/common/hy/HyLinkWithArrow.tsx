import { styled, type SxProps } from '@mui/material/styles'

import { HOVER_MEDIA, hy } from './hyTokens'

// arrow_forward / arrow_back / arrow_outward icons: match hy-ds Material Symbols shapes
const ArrowForwardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M645-433H135v-94h510L413-759l67-67 346 346-346 345-67-66 232-232Z" />
  </svg>
)

const ArrowBackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m315-433 232 232-67 66-345-345 345-346 67 67-232 232h511v94H315Z" />
  </svg>
)

const ArrowOutwardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m250-221-67-67 395-395H224v-94h515v514h-95v-353L250-221Z" />
  </svg>
)

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
  sx?: SxProps
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
  '&:active': {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationSkipInk: 'auto',
    textDecorationThickness: '7%',
    textUnderlineOffset: '12%',
    textUnderlinePosition: 'from-font',
    color: hy.textColor.linkActive,
    [`& .${ICON_CLASS}`]: {
      backgroundColor: hy.bgColor.primaryActive,
    },
  },
  [HOVER_MEDIA]: {
    '&:hover': {
      textDecorationLine: 'underline',
      textDecorationStyle: 'solid',
      textDecorationSkipInk: 'auto',
      textDecorationThickness: '7%',
      textUnderlineOffset: '12%',
      textUnderlinePosition: 'from-font',
      color: hy.textColor.linkHover,
      [`& .${ICON_CLASS}`]: {
        backgroundColor: hy.bgColor.primaryHover,
      },
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
  '& svg': {
    width: '1.5rem',
    height: '1.5rem',
    '@media (min-width: 30rem)': {
      width: '2rem',
      height: '2rem',
    },
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

const iconMap: Record<HyLinkIcon, React.ReactElement> = {
  arrow_forward: <ArrowForwardIcon />,
  arrow_back: <ArrowBackIcon />,
  arrow_outward: <ArrowOutwardIcon />,
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
