export const matrixContainerSx = {
  maxHeight: '91vh',
  overflow: 'auto',
  border: '1px solid',
  borderColor: 'divider',
} as const

export const stickyFirstCellSx = {
  position: 'sticky',
  left: 0,
  zIndex: 2,
  backgroundColor: '#ffffff',
  borderRight: '1px solid',
  borderRightColor: 'divider',
  maxWidth: 420,
} as const

export const stickyCornerCellSx = {
  ...stickyFirstCellSx,
  zIndex: 4,
  backgroundColor: '#f9fafb',
} as const

export const stickyHeaderCellSx = {
  p: 0.5,
  verticalAlign: 'bottom',
  zIndex: 3,
  backgroundColor: '#f9fafb',
} as const

export const verticalHeaderLabelSx = {
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
  whiteSpace: 'nowrap',
  fontSize: 12,
  fontWeight: 600,
} as const
