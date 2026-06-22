// Resolved values of hy-design-system semantic theme tokens (from variables.css).
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
    success: '#257e29', // --ds-borderColor-success (--ds-palette-green-60)
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
    neutralLight: '#f7f7f7', // --ds-bgColor-neutralLight
    neutralLightHover: '#f2f2f2', // --ds-bgColor-neutralLight-hover
    neutralLightActive: '#e6e6e6', // --ds-bgColor-neutralLight-active
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
    secondary: '#4d4d4d', // --ds-textColor-secondary (--ds-palette-black-70)
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
    linkVisited: '#551a8b', // --ds-textColor-link-visited
  },
  iconColor: {
    danger: '#bd2828', // --ds-iconColor-danger (--ds-palette-red-60)
    success: '#257e29', // --ds-iconColor-success (--ds-palette-green-60)
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
  fontFamily: {
    heading: "'Open Sans Variable', 'Open Sans', sans-serif", // --ds-fontFamily-heading
    body: "'Open Sans Variable', 'Open Sans', sans-serif", // --ds-fontFamily-body
  },
  fontSize: {
    12: 12, // --ds-fontSize-12
    14: 14, // --ds-fontSize-14
    16: 16, // --ds-fontSize-16
    18: 18, // --ds-fontSize-18
    20: 20, // --ds-fontSize-20
    22: 22, // --ds-fontSize-22
    24: 24, // --ds-fontSize-24
    32: 32, // --ds-fontSize-32
    40: 40, // --ds-fontSize-40
  },
  fontWeight: {
    regular: 400, // --ds-fontWeight-regular
    semibold: 600, // --ds-fontWeight-semibold
    semiboldPlus: 650, // --ds-fontWeight-semiboldPlus
    bold: 700, // --ds-fontWeight-bold
  },
  lineHeight: {
    small: 1, // --ds-lineHeight-small
    medium: 1.2, // --ds-lineHeight-medium
    large: 1.5, // --ds-lineHeight-large
    xLarge: 1.75, // --ds-lineHeight-xLarge
  },
  letterSpacing: {
    xTight: '-2px', // --ds-letterSpacing-xTight
    tight: '-1.4px', // --ds-letterSpacing-tight
    normal: '-0.4px', // --ds-letterSpacing-normal
    wide: '0px', // --ds-letterSpacing-wide
    xWide: '0.4px', // --ds-letterSpacing-xWide
  },
  fontStretch: {
    normal: '100%', // --ds-fontWidth-normal
    condense: '90%', // --ds-fontWidth-condense
  },
} as const
