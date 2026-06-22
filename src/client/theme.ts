import { createTheme } from '@mui/material'

import { hy } from './components/common/hy/hyTokens'

export default createTheme({
  typography: {
    fontFamily: hy.fontFamily.body,
    h1: {
      fontSize: hy.fontSize[40],
      fontWeight: hy.fontWeight.bold,
      letterSpacing: '-1.2px',
      fontStretch: hy.fontStretch.condense,
      lineHeight: '48px',
    },
    h2: {
      fontSize: hy.fontSize[32],
      fontWeight: hy.fontWeight.bold,
      letterSpacing: hy.letterSpacing.tight,
      fontStretch: hy.fontStretch.condense,
      lineHeight: '36px',
    },
    h3: {
      fontSize: hy.fontSize[24],
      fontWeight: hy.fontWeight.bold,
      letterSpacing: hy.letterSpacing.normal,
      lineHeight: '28px',
    },
    h4: {
      fontSize: hy.fontSize[20],
      fontWeight: hy.fontWeight.semiboldPlus,
      letterSpacing: hy.letterSpacing.normal,
      lineHeight: '28px',
    },
    h5: {
      fontSize: hy.fontSize[18],
      fontWeight: hy.fontWeight.semibold,
      letterSpacing: hy.letterSpacing.normal,
      lineHeight: '20px',
    },
    h6: {
      fontSize: hy.fontSize[16],
      fontWeight: hy.fontWeight.semibold,
      letterSpacing: hy.letterSpacing.normal,
      lineHeight: '18px',
    },
    subtitle1: {
      fontSize: hy.fontSize[18],
      fontWeight: hy.fontWeight.semibold,
      lineHeight: hy.lineHeight.large,
      letterSpacing: hy.letterSpacing.wide,
    },
    subtitle2: {
      fontSize: hy.fontSize[14],
      fontWeight: hy.fontWeight.semibold,
      lineHeight: hy.lineHeight.large,
      letterSpacing: hy.letterSpacing.wide,
    },
    body1: {
      fontSize: hy.fontSize[16],
      fontWeight: hy.fontWeight.regular,
      lineHeight: hy.lineHeight.large,
      letterSpacing: hy.letterSpacing.wide,
    },
    body2: {
      fontSize: hy.fontSize[14],
      fontWeight: hy.fontWeight.regular,
      lineHeight: hy.lineHeight.large,
      letterSpacing: hy.letterSpacing.wide,
    },
    caption: {
      fontSize: hy.fontSize[12],
      fontWeight: hy.fontWeight.regular,
      lineHeight: hy.lineHeight.large,
      letterSpacing: hy.letterSpacing.wide,
    },
  },
  palette: {
    primary: { main: hy.bgColor.white },
    secondary: { main: hy.bgColor.black },
    background: { default: hy.bgColor.neutralLight },
    text: { primary: hy.textColor.default },
  },
})
