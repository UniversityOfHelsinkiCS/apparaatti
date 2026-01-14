
/*


pure mock code, built with only speed in mind,


*/
import { Box, Stack, Typography, useTheme, useMediaQuery } from '@mui/material'
import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Toolbar from '@mui/material/Toolbar'
import { FilterContextProvider, useFilterContext } from './filterContext'
import SidebarContent from './sideBarContent'
import CourseRecommendations from './CourseRecommendations'
import WelcomeModal from './WelcomeModal'
import useApi from '../util/useApi'
import CurrentFilterDisplay from './currentFilterDisplay'

const desktopDrawerWidth = '33.333vw' // 1/3 of the viewport width
const mobileDrawerWidth = '80vw' // 80% of the viewport width for mobile

const OneThirdDrawerLayout = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(!isMobile) // Closed by default on mobile, open on desktop
  const { modalOpen, setModalOpen } = useFilterContext()

  useEffect(() => {
    setOpen(!isMobile) // Adjust drawer open state when screen size changes
  }, [isMobile])

  const toggleDrawer = () => setOpen((prev) => !prev)

  const { data: user, isLoading: isUserLoading } = useApi('user', '/api/user', 'GET', null)

  if(isUserLoading || user?.message === 'Unauthorized'){
    // window.location.assign('/api/login')
    return (
      <Stack direction='column' sx={{width: '100vw', height: '100vh'}}>
        <Typography variant='h2' sx={{marginLeft: 'auto', marginRight: 'auto'}}>Apparaatti</Typography> 
        <Typography sx={{marginLeft: 'auto', marginRight: 'auto'}}>Please log in: <a href="/api/login">here</a></Typography>
        
      </Stack>
    )
  }

  const currentDrawerWidth = isMobile ? mobileDrawerWidth : desktopDrawerWidth

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <WelcomeModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: (theme) => theme.transitions.create(['margin-left', 'width'], {
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
          <Typography variant="h6" noWrap>
            Course Finder
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.appBar - 1,
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar />
        <SidebarContent/>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexShrink: 0,
          width: open && !isMobile ? `calc(100vw - ${currentDrawerWidth})` : '100vw',
          ml: open && !isMobile ? currentDrawerWidth : 0,
          transition: (theme) => theme.transitions.create(['margin-left', 'width'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Toolbar />
        <CurrentFilterDisplay/>
        <Box sx={{ p: 2 }}>
          <CourseRecommendations />
        </Box>
      </Box>
    </Box>
  )
}

const AppV2 = () => {
  return (
    <FilterContextProvider>
      <OneThirdDrawerLayout/>
    </FilterContextProvider>
  )
}




export default AppV2
