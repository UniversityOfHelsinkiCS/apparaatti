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
import hyLogo from './assets/hy_logo_black.svg'
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
        bgcolor: hy.bgColor.neutral,
        overflow: 'hidden',
      }}
    >
      <CssBaseline />
      <WelcomeModal open={modalOpen} onClose={() => setModalOpen(false)} isAdmin={user?.isAdmin} />
      <FeedbackModal open={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />

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
        <AppBar
          position="relative"
          elevation={0}
          sx={{
            bgcolor: hy.bgColor.white,
            borderBottom: '1px solid',
            borderRight: '1px solid',
            borderLeft: '1px solid',
            borderColor: hy.borderColor.light,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Box component="img" src={hyLogo} alt="University of Helsinki" sx={{ height: 32, mr: 2 }} />
            <Typography
              variant="h4"
              noWrap
              sx={{
                flexGrow: 1,
                fontSize: '17px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
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

        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            anchor="left"
            open={!isMobile || open}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: isMobile ? false : true,
              disablePortal: isMobile ? true : false,
            }}
            sx={{
              zIndex: theme => theme.zIndex.appBar - 1,
              '& .MuiDrawer-paper': {
                width: isMobile ? mobileDrawerWidth : '400px',
                maxWidth: '500px',
                borderRight: '1px solid',
                borderLeft: '1px solid',
                borderColor: hy.borderColor.light,
                position: isMobile ? 'fixed' : 'relative',
                height: '100%',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              },
            }}
          >
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
