// Resolved values of hy-design-system semantic color tokens (from variables.css).
// Named to mirror the CSS variable hierarchy: hy.<category>.<token>
export const hy = {
  borderColor: {
    default: '#808080', // --ds-borderColor-default
    primary: '#005a94', // --ds-borderColor-primary
    disabledOnLight: 'rgb(0 0 0 / 15%)', // --ds-borderColor-disabled-onLight
    disabledOnDark: 'rgb(255 255 255 / 15%)', // --ds-borderColor-disabled-onDark
    white: '#fff', // --ds-borderColor-white
    black: '#0c0c0c', // --ds-borderColor-black
    danger: '#bd2828', // --ds-borderColor-danger
    light: '#ccc', // --ds-borderColor-light (--ds-palette-black-20)
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
    disabledOnDark: 'rgb(255 255 255 / 10%)', // --ds-bgColor-disabled-onDark
    black: '#0c0c0c', // --ds-bgColor-black
    blackHover: '#333', // --ds-bgColor-black-hover
    blackActive: '#4d4d4d', // --ds-bgColor-black-active
    transparentOnLight: 'rgb(0 0 0 / 0%)', // --ds-bgColor-transparent-onLight
    transparentOnLightHover: 'rgb(0 0 0 / 5%)', // --ds-bgColor-transparent-onLight-hover
    transparentOnLightActive: 'rgb(0 0 0 / 10%)', // --ds-bgColor-transparent-onLight-active
    transparentOnDarkHover: 'rgb(255 255 255 / 15%)', // --ds-bgColor-transparent-onDark-hover
    transparentOnDarkActive: 'rgb(255 255 255 / 30%)', // --ds-bgColor-transparent-onDark-active
    neutral: '#f2f2f2', // --ds-bgColor-neutral
    neutralHover: '#e6e6e6', // --ds-bgColor-neutral-hover
    neutralActive: '#ccc', // --ds-bgColor-neutral-active
    backdrop: 'rgb(0 0 0 / 50%)', // --ds-bgColor-backdrop
    success: '#dffbe1', // --ds-bgColor-success
    successHover: '#bef4c1', // --ds-bgColor-success-hover
    successActive: '#85e08a', // --ds-bgColor-success-active
    attention: '#fff1db', // --ds-bgColor-attention
    attentionHover: '#ffe7c2', // --ds-bgColor-attention-hover
    attentionActive: '#ffd799', // --ds-bgColor-attention-active
    danger: '#ffeceb', // --ds-bgColor-danger
    dangerHover: '#ffd8d6', // --ds-bgColor-danger-hover
    dangerActive: '#fdb7b4', // --ds-bgColor-danger-active
    dangerBold: '#bd2828', // --ds-bgColor-danger-bold
    dangerBoldHover: '#8b2623', // --ds-bgColor-danger-bold-hover
    dangerBoldActive: '#602220', // --ds-bgColor-danger-bold-active
    info: '#e5f8ff', // --ds-bgColor-info
    infoHover: '#c2eeff', // --ds-bgColor-info-hover
    infoActive: '#8adeff', // --ds-bgColor-info-active
  },
  textColor: {
    default: '#0c0c0c', // --ds-textColor-default
    primary: '#005a94', // --ds-textColor-primary
    white: '#fff', // --ds-textColor-white
    disabledOnLight: '#999', // --ds-textColor-disabled-onLight
    disabledOnDark: 'rgb(255 255 255 / 40%)', // --ds-textColor-disabled-onDark
    success: '#216325', // --ds-textColor-success
    attention: '#7a4b00', // --ds-textColor-attention
    danger: '#8b2623', // --ds-textColor-danger
    info: '#005b80', // --ds-textColor-info
    link: '#005a94', // --ds-textColor-link
    linkHover: '#003152', // --ds-textColor-link-hover
    linkActive: '#001929', // --ds-textColor-link-active
  },
  iconColor: {
    danger: '#bd2828', // --ds-iconColor-danger (--ds-palette-red-60)
    primary: '#005a94', // --ds-iconColor-primary (--ds-palette-mainBlue-70)
  },
  shadow: {
    overlay: '0 8px 15px 0 rgb(0 0 0 / 15%), 0 0 1px 0 rgb(0 0 0 / 30%)', // --ds-shadow-overlay
  },
  overlay: {
    black10: 'rgb(0 0 0 / 10%)', // --ds-overlay-black-10
  },
  palette: {
    red50: '#e13d37', // --ds-palette-red-50 (notification badge)
  },
} as const
