import { styled, type SxProps } from '@mui/material/styles'
import type { ReactNode, Ref } from 'react'
import { useId, useState } from 'react'

import VisuallyHidden from '../VisuallyHidden'
import { HOVER_MEDIA, hy } from './hyTokens'

// keyboard_arrow_up / keyboard_arrow_down icons: match hy-ds Material Symbols shapes
const KeyboardArrowUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    width="24"
    height="24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M480-530 283-333l-67-67 264-264 264 264-67 67-197-197Z" />
  </svg>
)

const KeyboardArrowDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    width="24"
    height="24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M480-320 216-584l67-67 197 197 197-197 67 67-264 264Z" />
  </svg>
)

type AccordionVariant = 'default' | 'compact'

export interface HyAccordionProps {
  summary: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onChange?: (open: boolean) => void
  variant?: AccordionVariant
  headingLevel?: number
  id?: string
  sx?: SxProps
  /* 200ms opening animation, not part of original hy-ds spec */
  animate?: boolean
  borders?: 'both' | 'top' | 'bottom' | 'none'
  action?: ReactNode
  triggerRef?: Ref<HTMLButtonElement>
  lockedOpenLabel?: string
}

// --- Styled elements ---

const Root = styled('div')({
  boxSizing: 'border-box',
  position: 'relative',
})

interface HeaderRowProps {
  $expanded: boolean
  $showTopBorder: boolean
  $showBottomBorder: boolean
}

const HeaderRow = styled('div', {
  shouldForwardProp: p => p !== '$expanded' && p !== '$showTopBorder' && p !== '$showBottomBorder',
})<HeaderRowProps>(({ $expanded, $showTopBorder, $showBottomBorder }) => ({
  position: 'relative',
  display: 'flex',
  borderTop: $showTopBorder ? `1px solid ${hy.borderColor.light}` : 'none',
  borderBottom: $showBottomBorder && !$expanded ? `1px solid ${hy.borderColor.light}` : 'none',
  backgroundColor: $expanded ? hy.bgColor.neutralLight : 'transparent',

  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    zIndex: 1,
  },
  [HOVER_MEDIA]: {
    '&:hover::after': {
      backgroundColor: hy.bgColor.transparentOnLightHover,
    },
  },
  '&:active::after': {
    backgroundColor: hy.bgColor.transparentOnLightActive,
  },

  '&:has([data-accordion-heading] button:focus-visible)': {
    boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
    outline: `2px solid ${hy.borderColor.black}`,
    outlineOffset: '0px',
    zIndex: 1,
  },
}))

const Title = styled('div')({
  position: 'relative',
  display: 'flex',
  flex: 1,
  minWidth: 0,
})

const OpenButtonContainer = styled('div')({
  position: 'relative',
  width: '100%',
})

const ActionSlot = styled('div')({
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  paddingInlineStart: '0.5rem',
  paddingInlineEnd: '0.75rem',
  '&:empty': { display: 'none' },
})

interface OpenButtonProps {
  $variant: AccordionVariant
}

const OpenButton = styled('button', {
  shouldForwardProp: p => p !== '$variant',
})<OpenButtonProps>(({ $variant }) => ({
  all: 'unset',
  boxSizing: 'border-box',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  gap: '0.75rem',
  width: '100%',
  color: hy.textColor.default,
  fill: hy.textColor.default,
  outline: '4px solid transparent',
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  fontWeight: 600,
  letterSpacing: '0px',
  lineHeight: '1.5',
  padding: 'calc(0.75rem - 1px) 0.75rem',
  fontSize: $variant === 'compact' ? '16px' : '18px',
  cursor: 'pointer',
}))

interface IconWrapperProps {
  $variant: AccordionVariant
}

const IconWrapper = styled('span', {
  shouldForwardProp: p => p !== '$variant',
})<IconWrapperProps>(({ $variant }) => ({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  paddingBlock: $variant === 'compact' ? 0 : '0.25rem',
}))

interface HeaderSlotProps {
  $variant: AccordionVariant
}

const HeaderSlot = styled('span', {
  shouldForwardProp: p => p !== '$variant',
})<HeaderSlotProps>(({ $variant }) => ({
  display: 'inline-block',
  width: '100%',
  paddingBlock: $variant === 'compact' ? '0' : '0.125rem',
}))

interface PanelWrapperProps {
  $expanded: boolean
}

const PanelWrapper = styled('div', {
  shouldForwardProp: p => p !== '$expanded',
})<PanelWrapperProps>(({ $expanded }) => ({
  display: 'grid',
  gridTemplateRows: $expanded ? '1fr' : '0fr',
  transition: $expanded ? 'grid-template-rows 250ms ease' : 'grid-template-rows 250ms ease, visibility 0s linear 250ms',
  visibility: $expanded ? 'visible' : 'hidden',
}))

const PanelOverflowClip = styled('div')({
  overflow: 'hidden',
})

const Panel = styled('div')({
  backgroundColor: hy.bgColor.neutralLight,
})

interface ContentProps {
  $showBottomBorder: boolean
}

const Content = styled('div', {
  shouldForwardProp: p => p !== '$showBottomBorder',
})<ContentProps>(({ $showBottomBorder }) => ({
  position: 'relative',
  color: hy.textColor.default,
  padding: '0.5rem 0.75rem 1rem 0.75rem',
  borderBottom: $showBottomBorder ? `1px solid ${hy.borderColor.light}` : 'none',
}))

// --- Component ---

const HyAccordion = ({
  summary,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onChange,
  variant = 'default',
  headingLevel = 2,
  id: idProp,
  sx,
  animate = false,
  borders = 'both',
  action,
  triggerRef,
  lockedOpenLabel,
}: HyAccordionProps) => {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const panelId = `${id}-panel`
  const lockedOpenLabelId = `${id}-locked-open`

  const showTopBorder = borders === 'both' || borders === 'top'
  const showBottomBorder = borders === 'both' || borders === 'bottom'

  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isExpanded = isControlled ? controlledOpen : internalOpen

  const isLockedOpen = lockedOpenLabel != null && isExpanded

  const handleClick = () => {
    if (isLockedOpen) return
    const next = !isExpanded
    if (!isControlled) setInternalOpen(next)
    onChange?.(next)
  }

  const renderPanelContent = () => (
    <Panel id={panelId} role="region" aria-labelledby={id}>
      <Content $showBottomBorder={showBottomBorder}>{children}</Content>
    </Panel>
  )

  return (
    <Root sx={sx}>
      <HeaderRow $expanded={isExpanded} $showTopBorder={showTopBorder} $showBottomBorder={showBottomBorder}>
        <Title role="heading" aria-level={headingLevel} data-accordion-heading="true">
          <OpenButtonContainer>
            <OpenButton
              ref={triggerRef}
              $variant={variant}
              onClick={handleClick}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              aria-disabled={isLockedOpen || undefined}
              aria-describedby={isLockedOpen ? lockedOpenLabelId : undefined}
              id={id}
              type="button"
            >
              <IconWrapper $variant={variant} aria-hidden="true">
                {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconWrapper>
              <HeaderSlot $variant={variant}>{summary}</HeaderSlot>
            </OpenButton>
          </OpenButtonContainer>
        </Title>
        {action && <ActionSlot>{action}</ActionSlot>}
      </HeaderRow>
      {isLockedOpen && <VisuallyHidden id={lockedOpenLabelId}>{lockedOpenLabel}</VisuallyHidden>}

      {animate ? (
        <PanelWrapper $expanded={isExpanded}>
          <PanelOverflowClip>{renderPanelContent()}</PanelOverflowClip>
        </PanelWrapper>
      ) : (
        isExpanded && renderPanelContent()
      )}
    </Root>
  )
}

export default HyAccordion
