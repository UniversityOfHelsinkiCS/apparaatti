import { styled, type SxProps } from '@mui/material/styles'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { HOVER_MEDIA, hy } from './hyTokens'

// Not an official hy-design-system component - modelled on the icon-only close button used inside HyModal.
export interface HyIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  sx?: SxProps
}

const StyledIconButton = styled('button')({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  padding: '0.125rem',
  minHeight: '2rem',
  minWidth: '2rem',
  color: hy.textColor.default,
  borderRadius: 0,

  '&:disabled': {
    cursor: 'not-allowed',
    color: hy.textColor.disabledOnLight,
  },

  [HOVER_MEDIA]: {
    '&:hover:not(:disabled)': {
      backgroundColor: hy.bgColor.transparentOnLightHover,
    },
  },
  '&:active:not(:disabled)': {
    backgroundColor: hy.bgColor.transparentOnLightActive,
  },
  '&:focus-visible': {
    outline: `2px solid ${hy.borderColor.black}`,
    outlineOffset: '2px',
    boxShadow: `0 0 0 2px ${hy.borderColor.white}`,
  },
})

const HyIconButton = ({ children, sx, type = 'button', ...props }: HyIconButtonProps) => (
  <StyledIconButton type={type} sx={sx} {...props}>
    {children}
  </StyledIconButton>
)

export default HyIconButton
