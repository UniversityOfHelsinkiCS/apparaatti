import MenuIcon from '@mui/icons-material/Menu'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Box, Menu, Typography } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import type { User } from '../common/types'
import hyLogo from './assets/hy_logo_black.svg'
import HyButton from './components/common/hy/HyButton'
import { HyMenuItem } from './components/common/hy/HySelect'
import { hy } from './components/common/hy/hyTokens'
import FeedbackModal from './components/FeedbackModal'
import LanguageSelector from './components/LanguageSelector'

type AppHeaderProps = {
  isNarrow: boolean
  isMobile: boolean
  toggleDrawer: () => void
  user: User
}

const AppHeader = ({ isNarrow, isMobile, toggleDrawer, user }: AppHeaderProps) => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null)
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <FeedbackModal open={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />

      <AppBar
        position="relative"
        elevation={0}
        sx={{
          bgcolor: hy.bgColor.white,
          borderBottom: '1px solid',
          borderRight: '1px solid',
          borderLeft: '1px solid',
          borderColor: hy.borderColor.light,
        }}
      >
        <Toolbar>
          {isNarrow && (
            <IconButton color="inherit" edge="start" onClick={toggleDrawer} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Box component="img" src={hyLogo} alt="University of Helsinki" sx={{ height: 32, mr: 2 }} />
          <Typography
            variant="h4"
            noWrap
            sx={{
              fontSize: '17px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            {t('v2:appTitle')}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={e => setMoreMenuAnchor(e.currentTarget)} sx={{ mr: '-12px' }}>
                <MoreVertIcon />
              </IconButton>

              <Menu
                anchorEl={moreMenuAnchor}
                open={Boolean(moreMenuAnchor)}
                onClose={() => setMoreMenuAnchor(null)}
                transitionDuration={0}
                slotProps={{
                  paper: {
                    elevation: 0,
                    style: {
                      border: `1px solid ${hy.borderColor.light}`,
                      borderRadius: 0,
                      boxShadow: hy.shadow.overlay,
                    },
                  },
                  list: { disablePadding: true },
                }}
              >
                <HyMenuItem
                  onClick={() => {
                    setFeedbackModalOpen(true)
                    setMoreMenuAnchor(null)
                  }}
                >
                  {t('v2:feedback.openButton')}
                </HyMenuItem>
                {user?.isAdmin && (
                  <HyMenuItem
                    onClick={() => {
                      navigate('/admin')
                      setMoreMenuAnchor(null)
                    }}
                  >
                    {t('v2:adminButton')}
                  </HyMenuItem>
                )}
                <Box sx={{ px: '12px', py: '10px', borderTop: `1px solid ${hy.borderColor.light}` }}>
                  <LanguageSelector sx={{ width: '100%' }} />
                </Box>
              </Menu>
            </>
          ) : (
            <>
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
            </>
          )}
        </Toolbar>
      </AppBar>
    </>
  )
}

export default AppHeader
