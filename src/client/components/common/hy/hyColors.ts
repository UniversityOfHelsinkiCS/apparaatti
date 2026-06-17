// Resolved values of hy-design-system semantic color tokens (from variables.css).
// Named to mirror the CSS variable hierarchy: hy.<category>.<token>
export const hy = {
  borderColor: {
    default: '#808080', // --ds-borderColor-default
    primary: '#005a94', // --ds-borderColor-primary
    disabledOnLight: 'rgb(0 0 0 / 15%)', // --ds-borderColor-disabled-onLight
  },
  bgColor: {
    white: '#fff', // --ds-bgColor-white
    whiteHover: '#f2f2f2', // --ds-bgColor-white-hover
    whiteActive: '#e6e6e6', // --ds-bgColor-white-active
    primary: '#005a94', // --ds-bgColor-primary
    primaryHover: '#003152', // --ds-bgColor-primary-hover
    primaryActive: '#001929', // --ds-bgColor-primary-active
    secondaryHover: '#e5f5ff', // --ds-bgColor-secondary-hover
    secondaryActive: '#cdebff', // --ds-bgColor-secondary-active
    disabledOnLight: 'rgb(0 0 0 / 10%)', // --ds-bgColor-disabled-onLight
    black: '#0c0c0c', // --ds-bgColor-black
    success: '#dffbe1', // --ds-bgColor-success
    attention: '#fff1db', // --ds-bgColor-attention
    danger: '#ffeceb', // --ds-bgColor-danger
    info: '#e5f8ff', // --ds-bgColor-info
  },
  textColor: {
    default: '#0c0c0c', // --ds-textColor-default
    primary: '#005a94', // --ds-textColor-primary
    white: '#fff', // --ds-textColor-white
    disabledOnLight: '#999', // --ds-textColor-disabled-onLight
    success: '#216325', // --ds-textColor-success
    attention: '#7a4b00', // --ds-textColor-attention
    danger: '#8b2623', // --ds-textColor-danger
    info: '#005b80', // --ds-textColor-info
  },
  overlay: {
    black10: 'rgb(0 0 0 / 10%)', // --ds-overlay-black-10
  },
  palette: {
    red50: '#e13d37', // --ds-palette-red-50 (notification badge)
  },
} as const
