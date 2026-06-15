import { Box, Stack, Typography, useTheme, useMediaQuery } from '@mui/material'
import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Toolbar from '@mui/material/Toolbar'
import { FilterContextProvider, useFilterContext } from './contexts/filterContext'
import SidebarContent from './components/SidebarContent'
import CourseRecommendations from './components/CourseRecommendations'
import WelcomeModal from './components/WelcomeModal'
import type { User } from '../common/types'
import LanguageSelector from './components/LanguageSelector'
import { useTranslation } from 'react-i18next'
import useRequiredUser from './util/useRequiredUser'
import { RedirectToLogin } from './util/redirectToLogin'
import FeedbackModal from './components/FeedbackModal'
<<<<<<< Updated upstream
import ActionButtonV2 from './components/common/ActionButtonV2'
import { useNavigate } from 'react-router-dom'
=======
import DsButton from './components/common/DsButton'
>>>>>>> Stashed changes

const desktopDrawerWidth = '38vw'
const mobileDrawerWidth = '88vw'

type OneThirdDrawerLayoutProps = {
  user: User
}

const OneThirdDrawerLayout = ({ user }: OneThirdDrawerLayoutProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(!isMobile)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const { modalOpen, setModalOpen } = useFilterContext()
  const { t } = useTranslation()
  const navigate = useNavigate()
  useEffect(() => {
    setOpen(!isMobile)
  }, [isMobile])

  const toggleDrawer = () => setOpen(prev => !prev)

  const currentDrawerWidth = isMobile ? mobileDrawerWidth : desktopDrawerWidth

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#f7f8fa',
      }}
    >
      <CssBaseline />
      <WelcomeModal open={modalOpen} onClose={() => setModalOpen(false)} isAdmin={user?.isAdmin} />
      <FeedbackModal open={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: theme =>
            theme.transitions.create(['margin-left', 'width'], {
              duration: theme.transitions.duration.shorter,
            }),
          ml: open && !isMobile ? currentDrawerWidth : 0,
          width: open && !isMobile ? `calc(100vw - ${currentDrawerWidth})` : '100vw',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {t('v2:appTitle')}
          </Typography>
          <LanguageSelector />
          <DsButton
            variant="supplementary"
            text={t('v2:feedback.openButton')}
            onClick={() => setFeedbackModalOpen(true)}
          />
          {user?.isAdmin && (
<<<<<<< Updated upstream
            <ActionButtonV2 visualStyle="app-bar" text={t('v2:adminButton')} onClick={() => navigate('/admin')} />
=======
            <DsButton variant="supplementary" text={t('v2:adminButton')} onClick={() => setAdminModalOpen(true)} />
>>>>>>> Stashed changes
          )}
        </Toolbar>
      </AppBar>

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
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: '#eef1f4',
            backgroundImage: 'linear-gradient(180deg, #f2f4f7 0%, #e7ebf0 100%)',
          },
        }}
      >
        <Toolbar />
        <SidebarContent />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexShrink: 0,
          width: open && !isMobile ? `calc(100vw - ${currentDrawerWidth})` : '100vw',
          ml: open && !isMobile ? currentDrawerWidth : 0,
          bgcolor: '#f7f8fa',
          backgroundImage: 'linear-gradient(180deg, #f9fafb 0%, #f1f3f6 100%)',
          transition: theme =>
            theme.transitions.create(['margin-left', 'width'], {
              duration: theme.transitions.duration.shorter,
            }),
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <CourseRecommendations />
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
