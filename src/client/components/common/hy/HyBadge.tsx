import { styled } from '@mui/material/styles'
import { hy } from './hyColors'

type BadgeVariant = 'default' | 'success' | 'attention' | 'danger' | 'info' | 'notification' | 'primary' | 'disabled'

interface HyBadgeProps {
  variant?: BadgeVariant
  ariaLabel?: string
  hiddenAssistiveText?: string
  children?: React.ReactNode
}

const variantStyles: Record<BadgeVariant, { backgroundColor: string; color: string }> = {
  default: { backgroundColor: hy.overlay.black10, color: hy.textColor.default },
  success: { backgroundColor: hy.bgColor.success, color: hy.textColor.success },
  attention: { backgroundColor: hy.bgColor.attention, color: hy.textColor.attention },
  danger: { backgroundColor: hy.bgColor.danger, color: hy.textColor.danger },
  info: { backgroundColor: hy.bgColor.info, color: hy.textColor.info },
  notification: { backgroundColor: hy.palette.red50, color: hy.textColor.white },
  primary: { backgroundColor: hy.bgColor.primary, color: hy.textColor.white },
  disabled: { backgroundColor: hy.overlay.black10, color: hy.textColor.disabledOnLight },
}

const BadgeRoot = styled('div')<{ ownerState: { variant: BadgeVariant } }>(({ ownerState }) => ({
  display: 'flex',
  width: 'fit-content',
  minWidth: 24,
  minHeight: 24,
  padding: '0 4px',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 4,
  borderRadius: 12,
  ...variantStyles[ownerState.variant],
}))

const BadgeContent = styled('div')({
  display: 'flex',
  padding: '0 4px',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 8,
})

const BadgeText = styled('span')({
  whiteSpace: 'nowrap',
  fontSize: 12,
  fontWeight: 600,
})

const VisuallyHidden = styled('span')({
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
})

const HyBadge = ({ variant = 'default', ariaLabel, hiddenAssistiveText, children }: HyBadgeProps) => (
  <BadgeRoot ownerState={{ variant }}>
    <BadgeContent>
      <BadgeText aria-label={ariaLabel}>
        {children}
        {hiddenAssistiveText && <VisuallyHidden>{hiddenAssistiveText}</VisuallyHidden>}
      </BadgeText>
    </BadgeContent>
  </BadgeRoot>
)

export default HyBadge
