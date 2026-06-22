import MenuIcon from '@mui/icons-material/Menu'
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import type { User } from '../common/types'
import HyButton from './components/common/hy/HyButton'
import { hy } from './components/common/hy/hyTokens'
import CourseRecommendations from './components/CourseRecommendations'
import FeedbackModal from './components/FeedbackModal'
import LanguageSelector from './components/LanguageSelector'
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(!isMobile)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const { modalOpen, setModalOpen } = useFilterContext()
  const { t } = useTranslation()
  const navigate = useNavigate()
  useEffect(() => {
    setOpen(!isMobile)
  }, [isMobile])

  const toggleDrawer = () => setOpen(prev => !prev)

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100vh',
        bgcolor: hy.bgColor.white,
        overflow: 'hidden',
      }}
    >
      <CssBaseline />
      <WelcomeModal open={modalOpen} onClose={() => setModalOpen(false)} isAdmin={user?.isAdmin} />
      <FeedbackModal open={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />

      <Box
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: '1200px',
          height: '100%',
          position: 'relative',
        }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          anchor="left"
          open={open}
          onClose={toggleDrawer}
          ModalProps={{
            keepMounted: isMobile ? false : true,
            disablePortal: isMobile ? true : false,
          }}
          sx={{
            zIndex: theme => theme.zIndex.appBar - 1,
            '& .MuiDrawer-paper': {
              width: isMobile ? mobileDrawerWidth : '100%',
              maxWidth: isMobile ? 'none' : '456px',
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderLeft: '1px solid',
              borderColor: 'divider',
              position: isMobile ? 'fixed' : 'relative',
              height: '100%',
            },
            ...(!isMobile && {
              width: open ? desktopDrawerWidth : 0,
              maxWidth: open ? '456px' : 0,
              flexShrink: 0,
              transition: theme =>
                theme.transitions.create(['width', 'max-width'], {
                  duration: theme.transitions.duration.shorter,
                }),
            }),
          }}
        >
          <Toolbar />
          <SidebarContent />
        </Drawer>

        <Box
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: isMobile ? '100%' : open ? `calc(100% - ${desktopDrawerWidth})` : '100%',
            height: '100%',
            bgcolor: hy.bgColor.neutral,
            transition: theme =>
              theme.transitions.create('width', {
                duration: theme.transitions.duration.shorter,
              }),
            overflowY: 'auto',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Toolbar>
              <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h4" noWrap sx={{ flexGrow: 1 }}>
                {t('v2:appTitle')}
              </Typography>
              <HyButton variant="supplementary" colour="black" size="small" onClick={() => setFeedbackModalOpen(true)}>
                {t('v2:feedback.openButton')}
              </HyButton>
              {user?.isAdmin && (
                <HyButton
                  variant="supplementary"
                  colour="black"
                  size="small"
                  onClick={() => navigate('/admin')}
                  sx={{ ml: 2 }}
                >
                  {t('v2:adminButton')}
                </HyButton>
              )}
              <LanguageSelector sx={{ ml: 3 }} />
            </Toolbar>
          </AppBar>

          <Box sx={{ p: 2, flexGrow: 1 }}>
            <CourseRecommendations />
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
