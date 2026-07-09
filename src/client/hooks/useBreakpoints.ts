import { useMediaQuery, useTheme } from '@mui/material'

/**
 * isDrawerLayout: viewport is narrow enough that the sidebar collapses into a temporary drawer
 * instead of staying open as a persistent panel.
 */
const useBreakpoints = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isDrawerLayout = useMediaQuery(theme.breakpoints.down('md'))

  return { isMobile, isDrawerLayout }
}

export default useBreakpoints
