import type { MenuItemProps } from '@mui/material/MenuItem'
import MenuItem from '@mui/material/MenuItem'
import type { SelectProps } from '@mui/material/Select'
import Select from '@mui/material/Select'
import { styled, type SxProps } from '@mui/material/styles'

import { HOVER_MEDIA, hy } from './hyTokens'

// 1px border-left + 8px padding + 24px icon + 8px padding
const ICON_AREA_WIDTH = 41

const CONTROL_HEIGHT = '2.75rem'

// Exact SVG paths from hy-ds ds-icon-keyboard-arrow-{down,up}, viewBox "0 -960 960 960"
const PATH_CHEVRON_DOWN = 'M480-320 216-584l67-67 197 197 197-197 67 67-264 264Z'
const PATH_CHEVRON_UP = 'M480-530 283-333l-67-67 264-264 264 264-67 67-197-197Z'

function ChevronIcon({ path }: { path: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

const IconContainer = styled('span')({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  borderLeft: `1px solid ${hy.borderColor.disabledOnLight}`,
  padding: '0 8px',
  color: 'inherit',
  pointerEvents: 'none',
  boxSizing: 'border-box',
})

function DropdownIcon({ className }: { className?: string }) {
  const isOpen = className?.includes('iconOpen') ?? false
  return (
    <IconContainer className={className}>
      <ChevronIcon path={isOpen ? PATH_CHEVRON_UP : PATH_CHEVRON_DOWN} />
    </IconContainer>
  )
}

// styled() loses Select's generic parameter; cast it back so HySelect can forward Value
const StyledSelect = styled(Select)({
  height: CONTROL_HEIGHT,
  borderRadius: 0,
  backgroundColor: hy.bgColor.white,
  color: hy.textColor.secondary,

  // !important: MUI's notchedOutline rule shares the same specificity; source order alone is unreliable
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: `${hy.borderColor.default} !important`,
    borderWidth: '2px !important',
    borderStyle: 'solid',
    borderRadius: 0,
    top: 0,
    '& legend': { display: 'none' },
  },

  [HOVER_MEDIA]: {
    '&:not(.Mui-disabled):not(:has(.MuiSelect-iconOpen)):hover': {
      backgroundColor: hy.bgColor.whiteHover,
    },
  },

  // mirrors hy-ds: show focus ring when open (.--open) or keyboard-focused (:focus-visible)
  '&:has(.MuiSelect-iconOpen), &:has(.MuiSelect-select:focus-visible)': {
    backgroundColor: hy.bgColor.white,
    boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
    outline: `2px solid ${hy.bgColor.black}`,
    outlineOffset: '2px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: `${hy.borderColor.primary} !important`,
    },
  },

  '&.Mui-disabled': {
    backgroundColor: hy.bgColor.disabledOnLight,
    cursor: 'not-allowed',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: `${hy.borderColor.disabledOnLight} !important`,
    },
    '& .MuiSelect-select': {
      cursor: 'not-allowed',
      WebkitTextFillColor: hy.textColor.disabledOnLight,
    },
    '& .MuiSelect-icon': {
      color: hy.textColor.disabledOnLight,
    },
  },

  // flex: 1 ensures the div covers the full width including under the icon, so pointer-events: none
  // on the icon passes clicks through to onMouseDown here (the only handler that opens the dropdown)
  //
  // vertical centering uses lineHeight rather than flex/alignItems: text-overflow ellipsis doesn't
  // reliably truncate a bare text node that's an anonymous flex item, so this stays a plain block box
  '& .MuiSelect-select': {
    flex: 1,
    alignSelf: 'stretch',
    lineHeight: CONTROL_HEIGHT,
    paddingLeft: '10px',
    paddingRight: `${ICON_AREA_WIDTH + 12}px !important`,
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
    fontSize: '16px',
    fontWeight: 400,
    color: hy.textColor.default,
    minHeight: 'unset !important',
    boxSizing: 'border-box',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // position: absolute over .MuiSelect-select; explicit width prevents collapse out of flow
  '& .MuiSelect-icon': {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: `${ICON_AREA_WIDTH}px`,
    color: 'inherit',
    transform: 'none !important',
  },
}) as <V = unknown>(props: SelectProps<V>) => React.JSX.Element

const StyledMenuItem = styled(MenuItem)({
  minHeight: '2.5rem',
  padding: '10px 12px',
  backgroundColor: hy.bgColor.white,
  color: hy.textColor.default,
  fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: 1.5,
  borderRadius: 0,

  [HOVER_MEDIA]: {
    '&:hover:not(.Mui-disabled)': {
      backgroundColor: hy.bgColor.whiteHover,
    },
  },

  '&:active:not(.Mui-disabled)': {
    backgroundColor: hy.bgColor.whiteActive,
  },

  '&.Mui-selected': {
    backgroundColor: hy.bgColor.primary,
    color: hy.textColor.white,
    [HOVER_MEDIA]: {
      '&:hover': {
        backgroundColor: hy.bgColor.primaryHover,
      },
    },
    '&:active': {
      backgroundColor: hy.bgColor.primaryActive,
    },
  },

  '&.Mui-disabled': {
    opacity: 1,
    color: hy.textColor.disabledOnLight,
  },

  '&.Mui-focusVisible': {
    boxShadow: `inset 0 0 0 4px ${hy.borderColor.black}`,
    outline: `2px solid ${hy.borderColor.white}`,
    outlineOffset: '-2px',
    backgroundColor: hy.bgColor.white,
    '&.Mui-selected': {
      backgroundColor: hy.bgColor.primary,
    },
  },
})

// MenuItem's root is display: flex (for icon/text layout), so ellipsis styles have to live on this
// nested span rather than on StyledMenuItem itself: a bare text node as an anonymous flex item won't
// truncate reliably. minWidth: 0 lets it shrink below its content size so overflow can kick in.
const MenuItemLabel = styled('span')({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const DEFAULT_MENU_PROPS: SelectProps['MenuProps'] = {
  transitionDuration: 0,
  slotProps: {
    paper: {
      elevation: 0,
      style: {
        border: `1px solid ${hy.borderColor.light}`,
        borderRadius: 0,
        boxShadow: hy.shadow.overlay,
        // caps the popup so long item labels ellipsize instead of growing the menu past the viewport
        maxWidth: 'calc(100vw - 32px)',
      },
    },
  },
  MenuListProps: {
    disablePadding: true,
  },
}

export interface HySelectProps<Value = unknown> extends Omit<SelectProps<Value>, 'variant'> {
  sx?: SxProps
}

export function HySelect<Value = unknown>({ sx, MenuProps: menuProps, ...props }: HySelectProps<Value>) {
  return (
    <StyledSelect {...props} IconComponent={DropdownIcon} MenuProps={{ ...DEFAULT_MENU_PROPS, ...menuProps }} sx={sx} />
  )
}

export type HyMenuItemProps = MenuItemProps

export function HyMenuItem({ sx, children, ...props }: HyMenuItemProps) {
  return (
    <StyledMenuItem {...props} disableRipple sx={sx}>
      <MenuItemLabel>{children}</MenuItemLabel>
    </StyledMenuItem>
  )
}

export default HySelect
