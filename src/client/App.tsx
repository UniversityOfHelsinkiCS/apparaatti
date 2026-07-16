import { Box } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import { useEffect, useRef, useState } from 'react'

import type { User } from '../common/types'
import AppHeader from './AppHeader'
import { hy } from './components/common/hy/hyTokens'
import CourseRecommendations from './components/CourseRecommendations'
import SidebarContent from './components/SidebarContent'
import WelcomeModal from './components/WelcomeModal'
import { FilterContextProvider, useFilterContext } from './contexts/filterContext'
import useBreakpoints from './hooks/useBreakpoints'
import { RedirectToLogin } from './util/redirectToLogin'
import useRequiredUser from './util/useRequiredUser'

const desktopDrawerWidth = '38%'
const mobileDrawerWidth = '88vw'

type OneThirdDrawerLayoutProps = {
  user: User
}

const OneThirdDrawerLayout = ({ user }: OneThirdDrawerLayoutProps) => {
  const { isDrawerLayout } = useBreakpoints()
  const [open, setOpen] = useState(!isDrawerLayout)
  const { modalOpen, setModalOpen } = useFilterContext()
  const wasModalOpenRef = useRef(modalOpen)

  useEffect(() => {
    setOpen(!isDrawerLayout)
  }, [isDrawerLayout])

  // open the drawer once the welcome modal is answered and closed
  useEffect(() => {
    if (wasModalOpenRef.current && !modalOpen) {
      setOpen(true)
    }
    wasModalOpenRef.current = modalOpen
  }, [modalOpen])

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
          '@media (min-width: 1200px)': {
            borderRight: '1px solid',
            borderLeft: '1px solid',
            borderColor: hy.borderColor.light,
          },
        }}
      >
        <AppHeader toggleDrawer={toggleDrawer} user={user} />

        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <Drawer
            variant={isDrawerLayout ? 'temporary' : 'persistent'}
            anchor="left"
            open={!isDrawerLayout || open}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true,
              disablePortal: isDrawerLayout ? true : false,
            }}
            slotProps={{ backdrop: { sx: { bgcolor: hy.bgColor.backdrop } } }}
            sx={{
              zIndex: theme => theme.zIndex.appBar - 1,
              '& .MuiDrawer-paper': {
                width: isDrawerLayout ? mobileDrawerWidth : '400px',
                maxWidth: '500px',
                borderRight: '1px solid',
                borderColor: hy.borderColor.light,
                position: isDrawerLayout ? 'fixed' : 'relative',
                height: '100%',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              },
            }}
          >
            <SidebarContent onClose={isDrawerLayout ? toggleDrawer : undefined} />
          </Drawer>

          <Box
            component="main"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: isDrawerLayout ? '100%' : open ? `calc(100% - ${desktopDrawerWidth})` : '100%',
              height: '100%',
              bgcolor: hy.bgColor.neutralLight,
              overflowY: 'auto',
              borderColor: hy.borderColor.light,
            }}
          >
            <Box sx={{ p: 2, flexGrow: 1 }}>
              <CourseRecommendations onOpenFilters={() => setOpen(true)} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const App = () => {
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()

  if (isUserLoading) return null // loads too quickly for loading state to make sense

  if (isUnauthorized || !user) {
    return <RedirectToLogin />
  }

  return (
    <FilterContextProvider>
      <OneThirdDrawerLayout user={user} />
    </FilterContextProvider>
  )
}

export default App
