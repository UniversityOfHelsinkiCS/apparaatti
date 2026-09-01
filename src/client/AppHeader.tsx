import { Box, Menu, Typography } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { MoreVertical, PanelLeftOpen } from 'lucide-react'
import { useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import type { User } from '../common/types'
import hyLogo from './assets/hy_logo_black.svg'
import HyButton from './components/common/hy/HyButton'
import HyIconButton from './components/common/hy/HyIconButton'
import { HyMenuItem } from './components/common/hy/HySelect'
import { hy } from './components/common/hy/hyTokens'
import VisuallyHidden from './components/common/VisuallyHidden'
import FeedbackModal from './components/FeedbackModal'
import LanguageSelector, { LANGUAGES } from './components/LanguageSelector'
import { FILTERS_REGION_ID } from './components/SidebarContent'
import { LanguageContext } from './contexts/languageContext'
import useBreakpoints from './hooks/useBreakpoints'

export const APP_DESCRIPTION_ID = 'app-description'

type AppHeaderProps = {
  toggleDrawer: () => void
  filtersOpen: boolean
  user: User
}

const AppHeader = ({ toggleDrawer, filtersOpen, user }: AppHeaderProps) => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isMobile, isDrawerLayout } = useBreakpoints()
  const { language, setAppLanguage } = useContext(LanguageContext)

  return (
    <>
      <FeedbackModal open={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />

      <AppBar
        position="relative"
        elevation={0}
        sx={{
          bgcolor: hy.bgColor.white,
          borderBottom: '1px solid',
          borderColor: hy.borderColor.light,
        }}
      >
        <Toolbar sx={{ px: '12x' }}>
          {isDrawerLayout && (
            <HyIconButton
              onClick={toggleDrawer}
              aria-label={filtersOpen ? t('v2:closeFilters') : t('v2:openFilters')}
              aria-expanded={filtersOpen}
              aria-controls={FILTERS_REGION_ID}
              data-testid="drawer-toggle"
              sx={{ mr: '14px' }}
            >
              <PanelLeftOpen size={24} />
            </HyIconButton>
          )}

          <Box component="img" src={hyLogo} alt={t('v2:universityLogoAlt')} sx={{ height: 32, mr: 2 }} />
          <Typography
            component="h1"
            variant="h4"
            noWrap
            aria-describedby={APP_DESCRIPTION_ID}
            data-testid="app-title"
            sx={{
              fontSize: '22px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {t('v2:appTitle')}
          </Typography>
          <VisuallyHidden component="p" id={APP_DESCRIPTION_ID} data-testid="app-description">
            {t('v2:appDescription')}
          </VisuallyHidden>

          <Box sx={{ flexGrow: 1 }} />

          {isMobile ? (
            <>
              <HyIconButton onClick={e => setMoreMenuAnchor(e.currentTarget)} aria-label={t('v2:moreOptions')}>
                <MoreVertical size={24} />
              </HyIconButton>

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
                {LANGUAGES.map(({ code, name }, index) => (
                  <HyMenuItem
                    key={code}
                    lang={code}
                    role="menuitemradio"
                    aria-checked={language === code}
                    selected={language === code}
                    onClick={() => {
                      setAppLanguage(code)
                      setMoreMenuAnchor(null)
                    }}
                    sx={index === 0 ? { borderTop: `1px solid ${hy.borderColor.light}` } : undefined}
                  >
                    {name}
                  </HyMenuItem>
                ))}
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
