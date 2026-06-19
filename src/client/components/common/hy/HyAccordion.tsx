import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { styled, type SxProps, type Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useId, useState } from 'react'

import { hy } from './hyColors'

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
  sx?: SxProps<Theme>
  /* 200ms opening animation, not part of original hy-ds spec */
  animate?: boolean
  borders?: 'both' | 'top' | 'bottom' | 'none'
}

// --- Styled elements ---

const Root = styled('div')({
  boxSizing: 'border-box',
  position: 'relative',
})

const Title = styled('div')({
  position: 'relative',
  display: 'flex',
})

const OpenButtonContainer = styled('div')({
  position: 'relative',
  width: '100%',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    zIndex: 1,
  },
  '&:hover::after': {
    backgroundColor: hy.bgColor.transparentOnLightHover,
  },
  '&:active::after': {
    backgroundColor: hy.bgColor.transparentOnLightActive,
  },
})

interface OpenButtonProps {
  $variant: AccordionVariant
  $expanded: boolean
  $showTopBorder: boolean
  $showBottomBorder: boolean
}

const OpenButton = styled('button', {
  shouldForwardProp: p => p !== '$variant' && p !== '$expanded' && p !== '$showTopBorder' && p !== '$showBottomBorder',
})<OpenButtonProps>(({ $variant, $expanded, $showTopBorder, $showBottomBorder }) => ({
  all: 'unset',
  boxSizing: 'border-box',
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'row',
  gap: '0.75rem',
  width: '100%',
  color: hy.textColor.default,
  fill: hy.textColor.default,
  outline: '4px solid transparent',
  borderTop: $showTopBorder ? `1px solid ${hy.borderColor.light}` : 'none',
  borderBottom: $showBottomBorder && !$expanded ? `1px solid ${hy.borderColor.light}` : 'none',
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  fontWeight: 600,
  letterSpacing: '0px',
  lineHeight: '1.5',
  padding: 'calc(0.75rem - 1px) 0.75rem',
  fontSize: $variant === 'compact' ? '14px' : '16px',
  cursor: 'pointer',
  backgroundColor: $expanded ? hy.bgColor.neutralLight : 'transparent',

  '&:focus-visible': {
    boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
    outline: `2px solid ${hy.borderColor.black}`,
    outlineOffset: '0px',
    zIndex: 1,
  },

  '@media (min-width: 60rem)': {
    fontSize: $variant === 'compact' ? '16px' : '18px',
  },
}))

const IconWrapper = styled('span')({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  paddingBlock: '0.25rem',
})

interface HeaderSlotProps {
  $variant: AccordionVariant
}

const HeaderSlot = styled('span', {
  shouldForwardProp: p => p !== '$variant',
})<HeaderSlotProps>(({ $variant }) => ({
  display: 'inline-block',
  width: '100%',
  paddingBlock: $variant === 'compact' ? '0.0625rem' : '0.25rem',

  '@media (min-width: 60rem)': {
    paddingBlock: $variant === 'compact' ? '0' : '0.125rem',
  },
}))

interface PanelWrapperProps {
  $expanded: boolean
}

const PanelWrapper = styled('div', {
  shouldForwardProp: p => p !== '$expanded',
})<PanelWrapperProps>(({ $expanded }) => ({
  display: 'grid',
  gridTemplateRows: $expanded ? '1fr' : '0fr',
  transition: 'grid-template-rows 200ms ease',
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
}: HyAccordionProps) => {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const panelId = `${id}-panel`

  const showTopBorder = borders === 'both' || borders === 'top'
  const showBottomBorder = borders === 'both' || borders === 'bottom'

  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isExpanded = isControlled ? controlledOpen : internalOpen

  const handleClick = () => {
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
      <Title role="heading" aria-level={headingLevel}>
        <OpenButtonContainer>
          <OpenButton
            $variant={variant}
            $expanded={isExpanded}
            $showTopBorder={showTopBorder}
            $showBottomBorder={showBottomBorder}
            onClick={handleClick}
            aria-expanded={isExpanded}
            aria-controls={panelId}
            id={id}
            type="button"
          >
            <IconWrapper aria-hidden="true">
              {isExpanded ? (
                <KeyboardArrowUpIcon sx={{ fontSize: '1.5rem' }} />
              ) : (
                <KeyboardArrowDownIcon sx={{ fontSize: '1.5rem' }} />
              )}
            </IconWrapper>
            <HeaderSlot $variant={variant}>{summary}</HeaderSlot>
          </OpenButton>
        </OpenButtonContainer>
      </Title>

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
