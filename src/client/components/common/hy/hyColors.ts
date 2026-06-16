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
    disabledOnLight: 'rgb(0 0 0 / 10%)', // --ds-bgColor-disabled-onLight
    black: '#0c0c0c', // --ds-bgColor-black
  },
} as const
