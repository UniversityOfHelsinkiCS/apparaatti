import { styled, type SxProps } from '@mui/material/styles'

import { HOVER_MEDIA, hy } from './hyTokens'

type TagColour = 'default' | 'black' | 'white' | 'info' | 'danger' | 'attention' | 'success'

interface HyTagProps {
  text: string
  colour?: TagColour
  href?: string
  target?: string
  onClick?: () => void
  ariaLabel?: string
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
  role?: string
  ariaHidden?: boolean
  sx?: SxProps
}

type ColourTokens = {
  color: string
  bg: string
  bgHover: string
  bgActive: string
}

const COLOUR_TOKENS: Record<TagColour, ColourTokens> = {
  default: {
    color: hy.textColor.default,
    bg: hy.bgColor.neutral,
    bgHover: hy.bgColor.neutralHover,
    bgActive: hy.bgColor.neutralActive,
  },
  black: {
    color: hy.textColor.white,
    bg: hy.bgColor.black,
    bgHover: hy.bgColor.blackHover,
    bgActive: hy.bgColor.blackActive,
  },
  white: {
    color: hy.textColor.default,
    bg: hy.bgColor.white,
    bgHover: hy.bgColor.whiteHover,
    bgActive: hy.bgColor.whiteActive,
  },
  info: {
    color: hy.textColor.default,
    bg: hy.bgColor.info,
    bgHover: hy.bgColor.infoHover,
    bgActive: hy.bgColor.infoActive,
  },
  danger: {
    color: hy.textColor.default,
    bg: hy.bgColor.danger,
    bgHover: hy.bgColor.dangerHover,
    bgActive: hy.bgColor.dangerActive,
  },
  attention: {
    color: hy.textColor.default,
    bg: hy.bgColor.attention,
    bgHover: hy.bgColor.attentionHover,
    bgActive: hy.bgColor.attentionActive,
  },
  success: {
    color: hy.textColor.default,
    bg: hy.bgColor.success,
    bgHover: hy.bgColor.successHover,
    bgActive: hy.bgColor.successActive,
  },
}

const TagRoot = styled('div')<{ ownerState: { colour: TagColour; isInteractive: boolean } }>(({ ownerState }) => {
  const { color, bg, bgHover, bgActive } = COLOUR_TOKENS[ownerState.colour]
  return {
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '1.5rem',
    padding: 'calc(0.125rem - 0.03125rem) 0.5rem',
    gap: '0.25rem',
    fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
    color,
    backgroundColor: bg,
    ...(ownerState.isInteractive && {
      [HOVER_MEDIA]: { '&:has(a:hover), &:has(button:hover)': { backgroundColor: bgHover } },
      '&:has(a:active), &:has(button:active)': { backgroundColor: bgActive },
      '&:focus-within': {
        boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
        outline: `2px solid ${hy.borderColor.black}`,
        outlineOffset: 1,
      },
    }),
  }
})

const TagText = styled('span')({
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: 0,
  lineHeight: 1.5,
})

const TagLink = styled('a')({
  display: 'contents',
  color: 'inherit',
  textDecoration: 'none',
  '&:focus-visible': { outline: 'none' },
})

const TagButton = styled('button')({
  display: 'contents',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  '&:focus-visible': { outline: 'none' },
})

const HyTag = ({
  text,
  colour = 'default',
  href,
  target,
  onClick,
  ariaLabel,
  prefixIcon,
  suffixIcon,
  role,
  ariaHidden,
  sx,
}: HyTagProps) => {
  const isLink = !!href
  const isButton = !isLink && !!onClick
  const isInteractive = isLink || isButton
  const effectiveAriaHidden = ariaHidden ?? !isInteractive

  return (
    <TagRoot ownerState={{ colour, isInteractive }} aria-hidden={effectiveAriaHidden} role={role} sx={sx}>
      {prefixIcon}
      {isLink ? (
        <TagLink href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined}>
          <TagText>{text}</TagText>
        </TagLink>
      ) : isButton ? (
        <TagButton type="button" onClick={onClick} aria-label={ariaLabel}>
          <TagText>{text}</TagText>
        </TagButton>
      ) : (
        <TagText>{text}</TagText>
      )}
      {suffixIcon}
    </TagRoot>
  )
}

export default HyTag
