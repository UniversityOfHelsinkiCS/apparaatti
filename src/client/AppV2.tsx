import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import { useEffect, useState } from 'react'

import type { User } from '../common/types'
import AppHeader from './AppHeader'
import { hy } from './components/common/hy/hyTokens'
import CourseRecommendations from './components/CourseRecommendations'
import SidebarContent from './components/SidebarContent'
import WelcomeModal from './components/WelcomeModal'
import { FilterContextProvider, useFilterContext } from './contexts/filterContext'
import { RedirectToLogin } from './util/redirectToLogin'
import useRequiredUser from './util/useRequiredUser'

const desktopDrawerWidth = '38%'
const mobileDrawerWidth = '88vw'

type OneThirdDrawerLayoutProps = {
  user: User
}

const OneThirdDrawerLayout = ({ user }: OneThirdDrawerLayoutProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(!isNarrow)
  const { modalOpen, setModalOpen } = useFilterContext()
  useEffect(() => {
    setOpen(!isNarrow)
  }, [isNarrow])

  const toggleDrawer = () => setOpen(prev => !prev)

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100vh',
        bgcolor: hy.bgColor.neutral,
        overflow: 'hidden',
      }}
    >
      <CssBaseline />
      <WelcomeModal open={modalOpen} onClose={() => setModalOpen(false)} isAdmin={user?.isAdmin} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '1200px',
          height: '100%',
          position: 'relative',
          boxShadow: '0 0 15px rgba(0, 0, 0, 0.15)',
        }}
      >
        <AppHeader isNarrow={isNarrow} isMobile={isMobile} toggleDrawer={toggleDrawer} user={user} />

        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <Drawer
            variant={isNarrow ? 'temporary' : 'persistent'}
            anchor="left"
            open={!isNarrow || open}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: isNarrow ? false : true,
              disablePortal: isNarrow ? true : false,
            }}
            sx={{
              zIndex: theme => theme.zIndex.appBar - 1,
              '& .MuiDrawer-paper': {
                width: isNarrow ? mobileDrawerWidth : '400px',
                maxWidth: '500px',
                borderRight: '1px solid',
                borderLeft: '1px solid',
                borderColor: hy.borderColor.light,
                position: isNarrow ? 'fixed' : 'relative',
                height: '100%',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              },
            }}
          >
            <SidebarContent onClose={isNarrow ? toggleDrawer : undefined} />
          </Drawer>

          <Box
            component="main"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: isNarrow ? '100%' : open ? `calc(100% - ${desktopDrawerWidth})` : '100%',
              height: '100%',
              bgcolor: hy.bgColor.neutralLight,
              overflowY: 'auto',
              borderRight: '1px solid',
              borderColor: hy.borderColor.light,
            }}
          >
            <Box sx={{ p: 2, flexGrow: 1 }}>
              <CourseRecommendations />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const AppV2 = () => {
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()

  if (isUserLoading) {
    return (
      <Stack direction="column" sx={{ width: '100vw', height: '100vh' }}>
        <Typography variant="h2" sx={{ marginLeft: 'auto', marginRight: 'auto' }}>
          Apparaatti
        </Typography>
      </Stack>
    )
  }

  if (isUnauthorized || !user) {
    return <RedirectToLogin />
  }

  return (
    <FilterContextProvider>
      <OneThirdDrawerLayout user={user} />
    </FilterContextProvider>
  )
}

export default AppV2
