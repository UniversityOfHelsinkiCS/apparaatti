import { Paper, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import BlackOutlinedButton from '../common/BlackOutlinedButton.tsx'
import LanguageSelector from '../LanguageSelector.tsx'

type AdminNavbarProps = {
  isSuperuser: boolean
}

const AdminNavbar = ({ isSuperuser }: AdminNavbarProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { label: t('v2:adminNav.overview'), path: '/admin' },
    { label: t('v2:adminNav.courses'), path: '/admin/courses' },
    { label: t('v2:adminNav.stats'), path: '/admin/stats' },
    { label: t('v2:adminNav.feedback'), path: '/admin/feedback' },
  ]

  if (isSuperuser) {
    navItems.push({ label: t('v2:adminNav.loginAs'), path: '/admin/login-as' })
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: '#fcfcfd',
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        useFlexGap
        alignItems={{ xs: 'stretch', lg: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} useFlexGap flexWrap="wrap">
          <BlackOutlinedButton
            type="button"
            onClick={() => navigate('/')}
            sx={{ borderColor: '#d1d5db', color: '#111827' }}
          >
            {t('v2:adminNav.backToApp')}
          </BlackOutlinedButton>
          {navItems.map(item => {
            const isActive = location.pathname === item.path

            return (
              <BlackOutlinedButton
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                sx={
                  isActive
                    ? {
                        backgroundColor: '#111827',
                        color: '#fff',
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: '#1f2937',
                          boxShadow: 'none',
                        },
                      }
                    : {
                        borderColor: '#d1d5db',
                        color: '#111827',
                      }
                }
              >
                {item.label}
              </BlackOutlinedButton>
            )
          })}
        </Stack>

        <LanguageSelector />
      </Stack>
    </Paper>
  )
}

export default AdminNavbar
