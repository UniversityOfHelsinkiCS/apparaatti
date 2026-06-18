import CloseIcon from '@mui/icons-material/Close'
import { styled, type SxProps, type Theme } from '@mui/material/styles'

import { hy } from './hyColors'

interface HyChipProps {
  label: string
  onClick?: (e?: React.MouseEvent) => void
  prefixIcon?: React.ReactNode
  ariaLabel?: string
  /** `small` is a custom addition, not part of the hy-ds spec */
  size?: 'medium' | 'small'
  sx?: SxProps<Theme>
}

const ChipRoot = styled('div')<{ ownerState: { size: 'medium' | 'small'; clickable: boolean } }>(({ ownerState }) => ({
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: hy.bgColor.white,
  color: hy.textColor.primary,
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  fontWeight: ownerState.size === 'small' ? 500 : 600,
  lineHeight: 1.5,
  letterSpacing: 0,
  borderRadius: '1rem',
  border: `${ownerState.size === 'small' ? 1 : 2}px solid ${hy.borderColor.primary}`,
  fontSize: ownerState.size === 'small' ? 12 : 14,
  padding: ownerState.size === 'small' ? '1px 6px' : 'calc(0.25rem - 0.03125rem) 0.5rem',
  ...(ownerState.clickable && {
    cursor: 'pointer',
    '&:hover': { backgroundColor: hy.bgColor.secondaryHover },
    '&:active': { backgroundColor: hy.bgColor.secondaryActive },
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
      outline: `2px solid ${hy.bgColor.black}`,
      outlineOffset: 2,
    },
  }),
}))

const ChipText = styled('span')<{ ownerState: { size: 'medium' | 'small' } }>(({ ownerState }) => ({
  padding: ownerState.size === 'small' ? '0 3px' : '0 4px',
}))

const HyChip = ({ label, onClick, prefixIcon, ariaLabel, size = 'medium', sx }: HyChipProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <ChipRoot
      ownerState={{ size, clickable: !!onClick }}
      sx={sx}
      {...(onClick && {
        role: 'button',
        tabIndex: 0,
        'aria-label': ariaLabel ?? `Remove ${label}`,
        onClick,
        onKeyDown: handleKeyDown,
      })}
    >
      {prefixIcon}
      <ChipText ownerState={{ size }}>{label}</ChipText>
      {onClick && <CloseIcon sx={{ fontSize: size === 'small' ? '0.75rem' : '1rem' }} />}
    </ChipRoot>
  )
}

export default HyChip
