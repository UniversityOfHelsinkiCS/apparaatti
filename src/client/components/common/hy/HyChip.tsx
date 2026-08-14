import { type CSSObject, styled, type SxProps } from '@mui/material/styles'

import { HOVER_MEDIA, hy } from './hyTokens'

// close icon: matches hy-ds Material Symbols "close" shape
const CloseIcon = ({ size }: { size: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m249-183-66-66 231-231-231-231 66-66 231 231 231-231 66 66-231 231 231 231-66 66-231-231-231 231Z" />
  </svg>
)

type ChipSize = 'medium' | 'small'

interface HyChipProps {
  label: string
  onClick?: (e?: React.MouseEvent) => void
  prefixIcon?: React.ReactNode
  ariaLabel?: string
  /** `small` is a custom addition, not part of the hy-ds spec */
  size?: ChipSize
  sx?: SxProps
}

const chipStyles = (size: ChipSize): CSSObject => ({
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: hy.bgColor.white,
  color: hy.textColor.primary,
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  fontWeight: size === 'small' ? 500 : 600,
  lineHeight: 1.5,
  letterSpacing: 0,
  borderRadius: '1rem',
  border: `${size === 'small' ? 1 : 2}px solid ${hy.borderColor.primary}`,
  fontSize: size === 'small' ? 12 : 14,
  padding: size === 'small' ? '1px 6px' : 'calc(0.25rem - 0.03125rem) 0.5rem',
})

const ChipRoot = styled('span')<{ ownerState: { size: ChipSize } }>(({ ownerState }) => chipStyles(ownerState.size))

const ChipButton = styled('button')<{ ownerState: { size: ChipSize } }>(({ ownerState }) => ({
  all: 'unset',
  ...chipStyles(ownerState.size),
  cursor: 'pointer',
  [HOVER_MEDIA]: { '&:hover': { backgroundColor: hy.bgColor.secondaryHover } },
  '&:active': { backgroundColor: hy.bgColor.secondaryActive },
  '&:focus-visible': {
    boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
    outline: `2px solid ${hy.bgColor.black}`,
    outlineOffset: 2,
  },
}))

const ChipText = styled('span')<{ ownerState: { size: ChipSize } }>(({ ownerState }) => ({
  padding: ownerState.size === 'small' ? '0 3px' : '0 4px',
}))

const HyChip = ({ label, onClick, prefixIcon, ariaLabel, size = 'medium', sx }: HyChipProps) => {
  const content = (
    <>
      {prefixIcon}
      <ChipText ownerState={{ size }}>{label}</ChipText>
      {onClick && <CloseIcon size={size === 'small' ? 12 : 16} />}
    </>
  )

  if (!onClick) {
    return (
      <ChipRoot ownerState={{ size }} sx={sx}>
        {content}
      </ChipRoot>
    )
  }

  return (
    <ChipButton
      type="button"
      ownerState={{ size }}
      sx={sx}
      aria-label={ariaLabel ?? `Remove ${label}`}
      onClick={onClick}
    >
      {content}
    </ChipButton>
  )
}

export default HyChip
