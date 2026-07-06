import ReportIcon from '@mui/icons-material/Report'
import MuiModal from '@mui/material/Modal'
import { styled, type SxProps } from '@mui/material/styles'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { HOVER_MEDIA, hy } from './hyTokens'

const MODAL_IN_DURATION = 220
const MODAL_OUT_DURATION = 160

type ModalSize = 'auto' | 'small' | 'medium' | 'large' | 'full'
type ModalVariant = 'default' | 'danger'

export interface HyModalProps {
  open: boolean
  onClose: () => void
  title?: string
  variant?: ModalVariant
  size?: ModalSize
  closeable?: boolean
  backdropCloseable?: boolean
  showCloseButton?: boolean
  scrollable?: boolean
  headingLevel?: number
  header?: ReactNode
  footer?: ReactNode
  children?: ReactNode
  sx?: SxProps
}

const sizeWidths: Record<Exclude<ModalSize, 'auto' | 'full'>, string> = {
  small: '480px',
  medium: '640px',
  large: '800px',
}

// --- Styled elements ---

const Positioner = styled('div')({
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  minHeight: '100dvh',
  paddingTop: '1rem',
  paddingBottom: 0,
  marginTop: 'auto',
  marginBottom: 0,

  '@media (min-width: 30rem)': {
    justifyContent: 'center',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  '@media (min-width: 60rem)': {
    paddingTop: '2.5rem',
    paddingBottom: '2.5rem',
  },
})

interface ContainerProps {
  $size: ModalSize
  $open: boolean
  $in: boolean
  $scrollable: boolean
}

const Container = styled('div', {
  shouldForwardProp: p => p !== '$size' && p !== '$open' && p !== '$in' && p !== '$scrollable',
})<ContainerProps>(({ $size, $open, $in, $scrollable }) => ({
  pointerEvents: 'auto',
  cursor: 'unset',
  border: `1px solid ${hy.borderColor.light}`,
  backgroundColor: hy.bgColor.white,
  boxShadow: hy.shadow.overlay,
  // Closed / exiting state
  scale: $open ? '1' : '0.98',
  opacity: $open ? 1 : 0,
  transform: $open ? 'translateY(0)' : 'translateY(0.75rem)',
  transition: $in
    ? `scale ${MODAL_IN_DURATION}ms ease-out, opacity ${MODAL_IN_DURATION}ms ease-out, transform ${MODAL_IN_DURATION}ms ease-out`
    : `scale ${MODAL_OUT_DURATION}ms ease-out, opacity ${MODAL_OUT_DURATION}ms ease-out, transform ${MODAL_OUT_DURATION}ms ease-out`,

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },

  '@media (min-width: 30rem)': {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: $size === 'full' ? '100%' : $size === 'auto' ? 'fit-content' : sizeWidths[$size],
    maxWidth: 'calc(100vw - 2 * 1rem)',
  },
  '@media (min-width: 60rem)': {
    maxWidth: 'calc(100vw - 2 * 2.5rem)',
  },

  ...($scrollable && {
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    maxHeight: 'calc(100dvh - 1rem)',
    minHeight: 'calc(320px - 2 * 1rem)',

    '@media (min-width: 30rem)': {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: $size === 'full' ? '100%' : $size === 'auto' ? 'fit-content' : sizeWidths[$size],
      maxWidth: 'calc(100vw - 2 * 1rem)',
      maxHeight: 'calc(100dvh - 2 * 1rem)',
    },
    '@media (min-width: 60rem)': {
      maxWidth: 'calc(100vw - 2 * 2.5rem)',
      maxHeight: 'calc(100dvh - 2 * 2.5rem)',
    },
  }),
}))

interface HeaderProps {
  $sticky: boolean
}

const Header = styled('div', {
  shouldForwardProp: p => p !== '$sticky',
})<HeaderProps>(({ $sticky }) => ({
  position: $sticky ? 'sticky' : 'relative',
  top: $sticky ? 0 : undefined,
  display: 'flex',
  flexDirection: 'row' as const,
  justifyContent: 'space-between',
  gap: '0.5rem',
  paddingTop: '1rem',
  paddingBottom: '1rem',
  paddingLeft: '1rem',
  paddingRight: '1rem',
  backgroundColor: $sticky ? hy.bgColor.white : undefined,
  borderBottom: $sticky ? `1px solid ${hy.borderColor.light}` : undefined,

  '@media (min-width: 30rem)': {
    paddingTop: '1.5rem',
    paddingBottom: '1rem',
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
  },
}))

const Heading = styled('span')({
  display: 'flex',
  gap: '0.75rem',
  color: hy.textColor.default,
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  fontSize: '20px',
  fontWeight: 650,
  letterSpacing: '-0.4px',
  lineHeight: '28px',
  fontStretch: '100%',
  textTransform: 'none' as const,

  '@media (min-width: 60rem)': {
    fontSize: '24px',
    lineHeight: '24px',
  },

  '&:focus-visible': {
    outline: `2px solid ${hy.borderColor.black}`,
    outlineOffset: '2px',
    boxShadow: `0 0 0 2px ${hy.borderColor.white}`,
  },
})

const HeadingText = styled('span')({
  marginTop: '0.125rem',
  marginBottom: '0.125rem',

  '@media (min-width: 60rem)': {
    marginTop: '0.375rem',
    marginBottom: '0.375rem',
  },
})

const CloseButton = styled('button')({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 'auto',
  flexShrink: 0,
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  padding: '0.125rem',
  minHeight: '2rem',
  minWidth: '2rem',
  color: hy.textColor.default,
  borderRadius: 0,

  '@media (min-width: 60rem)': {
    marginTop: '0.125rem',
    marginBottom: '0.125rem',
  },

  [HOVER_MEDIA]: {
    '&:hover': {
      backgroundColor: hy.bgColor.transparentOnLightHover,
    },
  },
  '&:active': {
    backgroundColor: hy.bgColor.transparentOnLightActive,
  },
  '&:focus-visible': {
    outline: `2px solid ${hy.borderColor.black}`,
    outlineOffset: '2px',
    boxShadow: `0 0 0 2px ${hy.borderColor.white}`,
  },
})

// Close icon: simple SVG X matching Google Material "close" icon shape
const CloseIconSvg = () => (
  <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

interface ContentProps {
  $scrollable: boolean
  $hasFooter: boolean
}

const Content = styled('div', {
  shouldForwardProp: p => p !== '$scrollable' && p !== '$hasFooter',
})<ContentProps>(({ $scrollable, $hasFooter }) => ({
  position: 'relative',
  paddingLeft: '1rem',
  paddingRight: '1rem',
  paddingBottom: $hasFooter ? 0 : '1rem',
  flex: '1',
  minHeight: 0,
  color: hy.textColor.default,
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  fontSize: '16px',
  fontWeight: 400,
  letterSpacing: '0px',
  lineHeight: '1.5',

  '@media (min-width: 30rem)': {
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    paddingBottom: $hasFooter ? 0 : '1.5rem',
  },
  '@media (min-width: 60rem)': {
    fontSize: '18px',
  },

  ...($scrollable && {
    overflowY: 'auto' as const,
    paddingBottom: 'unset',
  }),

  '&:focus-visible': {
    outline: `2px solid ${hy.borderColor.black}`,
    outlineOffset: '-2px',
    boxShadow: `inset 0 0 0 4px ${hy.borderColor.white}`,
  },
}))

const ScrollScrim = styled('div', {
  shouldForwardProp: p => p !== '$position' && p !== '$visible',
})<{ $position: 'top' | 'bottom'; $visible: boolean }>(({ $position, $visible }) => ({
  display: $visible ? 'block' : 'none',
  pointerEvents: 'none',
  width: '100%',
  height: '2.75rem',
  marginTop: $position === 'bottom' ? '-2.75rem' : 0,
  marginBottom: $position === 'top' ? '-2.75rem' : 0,
  flex: '0 0 auto',
  position: 'sticky',
  zIndex: 1,
  top: $position === 'top' ? 0 : undefined,
  bottom: $position === 'bottom' ? 0 : undefined,
  background:
    $position === 'top'
      ? `linear-gradient(to bottom, ${hy.bgColor.white} 0%, ${hy.bgColor.transparentOnLight} 100%)`
      : `linear-gradient(to top, ${hy.bgColor.white} 0%, ${hy.bgColor.transparentOnLight} 100%)`,
}))

const Footer = styled('div')({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column' as const,
  padding: '1rem',
  gap: '0.75rem',

  '@media (min-width: 30rem)': {
    flexDirection: 'row' as const,
    padding: '1.5rem',
    gap: '1rem',
  },
})

const StickyFooter = styled(Footer)({
  position: 'sticky',
  bottom: 0,
  backgroundColor: hy.bgColor.white,
  borderTop: `1px solid ${hy.borderColor.light}`,
})

// --- Component ---

const HyModal = ({
  open,
  onClose,
  title,
  variant = 'default',
  size = 'medium',
  closeable = true,
  backdropCloseable = true,
  showCloseButton = true,
  scrollable = false,
  headingLevel = 2,
  header,
  footer,
  children,
  sx,
}: HyModalProps) => {
  const [modalMounted, setModalMounted] = useState(open)
  const [containerOpen, setContainerOpen] = useState(false)
  const [containerIn, setContainerIn] = useState(false)

  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let inTimer: ReturnType<typeof setTimeout>
    let rafId: ReturnType<typeof requestAnimationFrame>

    if (open) {
      setModalMounted(true)
      setContainerIn(true)
      rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setContainerOpen(true)
        })
      })
      inTimer = setTimeout(() => setContainerIn(false), MODAL_IN_DURATION)
    } else {
      setContainerOpen(false)
      setContainerIn(false)
      inTimer = setTimeout(() => setModalMounted(false), MODAL_OUT_DURATION)
    }

    return () => {
      clearTimeout(inTimer)
      cancelAnimationFrame(rafId)
    }
  }, [open])

  const calculateScrollState = useCallback(() => {
    const el = contentRef.current
    if (!el || !scrollable) return
    setAtTop(el.scrollTop === 0)
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight)
  }, [scrollable])

  useEffect(() => {
    if (open && scrollable) {
      calculateScrollState()
    }
  }, [open, scrollable, calculateScrollState])

  const handleMuiClose = (_: unknown, reason: string) => {
    if (reason === 'backdropClick' && (!closeable || !backdropCloseable)) return
    if (reason === 'escapeKeyDown' && !closeable) return
    onClose()
  }

  const role = variant === 'danger' ? 'alertdialog' : 'dialog'

  const FooterWrapper = scrollable ? StickyFooter : Footer

  return (
    <MuiModal
      open={modalMounted}
      onClose={handleMuiClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: containerOpen ? hy.bgColor.backdrop : hy.bgColor.transparentOnLight,
            transition: containerIn
              ? `background-color ${MODAL_IN_DURATION}ms ease`
              : `background-color ${MODAL_OUT_DURATION}ms ease`,
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          },
        },
      }}
    >
      <Positioner>
        <Container
          $size={size}
          $open={containerOpen}
          $in={containerIn}
          $scrollable={scrollable}
          role={role}
          aria-modal
          aria-labelledby={title ? 'hy-modal-title' : undefined}
          sx={sx}
        >
          {header ?? (
            <Header $sticky={scrollable}>
              {title && (
                <Heading id="hy-modal-title" role="heading" aria-level={headingLevel} tabIndex={-1}>
                  {variant === 'danger' && (
                    <ReportIcon
                      aria-label="Warning"
                      sx={{
                        color: hy.iconColor.danger,
                        fontSize: { xs: '1.5rem', sm: '1.75rem' },
                        marginTop: '0.125rem',
                        marginBottom: '0.125rem',
                        marginRight: '0.25rem',
                        '@media (min-width: 60rem)': {
                          marginTop: '0.25rem',
                          marginBottom: '0.25rem',
                        },
                      }}
                    />
                  )}
                  <HeadingText>{title}</HeadingText>
                </Heading>
              )}
              {closeable && showCloseButton && (
                <CloseButton aria-label="Close" onClick={onClose} type="button">
                  <CloseIconSvg />
                </CloseButton>
              )}
            </Header>
          )}

          {scrollable ? (
            <>
              <ScrollScrim $position="top" $visible={!atTop} aria-hidden />
              <Content
                $scrollable
                $hasFooter={footer != null}
                ref={contentRef}
                onScroll={calculateScrollState}
                aria-label="Content scroll area"
                tabIndex={0}
              >
                {children}
              </Content>
              <ScrollScrim $position="bottom" $visible={!atBottom} aria-hidden />
            </>
          ) : (
            <Content $scrollable={false} $hasFooter={footer != null}>
              {children}
            </Content>
          )}

          {footer != null && <FooterWrapper>{footer}</FooterWrapper>}
        </Container>
      </Positioner>
    </MuiModal>
  )
}

export default HyModal
