import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import type { MenuItemProps } from '@mui/material/MenuItem'
import MenuItem from '@mui/material/MenuItem'
import type { SelectProps } from '@mui/material/Select'
import Select from '@mui/material/Select'
import { styled, type SxProps, type Theme } from '@mui/material/styles'

import { hy } from './hyColors'

// Icon area: 1px border-left + 8px pad-left + 24px icon + 8px pad-right = 41px
const ICON_AREA_WIDTH = 41

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
      <KeyboardArrowDownIcon
        sx={{
          fontSize: 24,
          transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'rotate(180deg)' : 'none',
        }}
      />
    </IconContainer>
  )
}

const StyledSelect = styled(Select)({
  height: '2.75rem',
  borderRadius: 0,
  backgroundColor: hy.bgColor.white,
  color: hy.textColor.secondary,

  '& .MuiOutlinedInput-notchedOutline': {
    border: `2px solid ${hy.borderColor.default}`,
    borderRadius: 0,
    top: 0,
    '& legend': { display: 'none' },
  },

  // Hover: bg change (only when not disabled/focused)
  '&:not(.Mui-disabled):not(.Mui-focused):hover': {
    backgroundColor: hy.bgColor.whiteHover,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: hy.borderColor.default,
    },
  },

  // Focus/open: focus ring + primary border color
  '&.Mui-focused': {
    backgroundColor: hy.bgColor.white,
    boxShadow: `0 0 0 2px ${hy.bgColor.white}`,
    outline: `2px solid ${hy.bgColor.black}`,
    outlineOffset: '2px',
    '& .MuiOutlinedInput-notchedOutline': {
      border: `2px solid ${hy.borderColor.primary}`,
    },
  },

  // Disabled
  '&.Mui-disabled': {
    backgroundColor: hy.bgColor.disabledOnLight,
    cursor: 'not-allowed',
    '& .MuiOutlinedInput-notchedOutline': {
      border: `2px solid ${hy.borderColor.disabledOnLight}`,
    },
    '& .MuiSelect-select': {
      cursor: 'not-allowed',
      WebkitTextFillColor: hy.textColor.disabledOnLight,
    },
    '& .MuiSelect-icon': {
      color: hy.textColor.disabledOnLight,
    },
  },

  // Selected text area
  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '10px',
    paddingRight: `${ICON_AREA_WIDTH}px !important`,
    paddingTop: '0 !important',
    paddingBottom: '0 !important',
    height: '100%',
    fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
    fontSize: '16px',
    fontWeight: 400,
    color: hy.textColor.default,
    minHeight: 'unset !important',
    boxSizing: 'border-box',
  },

  // Icon container: stretch full height, positioned at right edge
  '& .MuiSelect-icon': {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    height: 'auto',
    width: 'auto',
    color: 'inherit',
    transform: 'none !important',
  },
})

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

  '&:hover:not(.Mui-disabled)': {
    backgroundColor: hy.bgColor.whiteHover,
  },

  '&:active:not(.Mui-disabled)': {
    backgroundColor: hy.bgColor.whiteActive,
  },

  '&.Mui-selected': {
    backgroundColor: hy.bgColor.primary,
    color: hy.textColor.white,
    '&:hover': {
      backgroundColor: hy.bgColor.primaryHover,
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

const DEFAULT_MENU_PROPS: SelectProps['MenuProps'] = {
  PaperProps: {
    sx: {
      borderRadius: 0,
      border: `1px solid ${hy.borderColor.light}`,
      boxShadow: hy.shadow.overlay,
      marginTop: 0,
    },
  },
  MenuListProps: {
    disablePadding: true,
  },
}

export interface HySelectProps extends Omit<SelectProps, 'variant'> {
  sx?: SxProps<Theme>
}

export function HySelect({ sx, MenuProps: menuProps, ...props }: HySelectProps) {
  return (
    <StyledSelect
      {...props}
      variant="outlined"
      IconComponent={DropdownIcon}
      MenuProps={{ ...DEFAULT_MENU_PROPS, ...menuProps }}
      sx={[...(Array.isArray(sx) ? sx : [sx])]}
    />
  )
}

export type HyMenuItemProps = MenuItemProps

export function HyMenuItem({ sx, ...props }: HyMenuItemProps) {
  return <StyledMenuItem {...props} disableRipple sx={[...(Array.isArray(sx) ? sx : [sx])]} />
}

export default HySelect
