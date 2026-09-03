import { Box, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useRequiredUser from '../../util/useRequiredUser.ts'
import AdminNavbar from './AdminNavbar.tsx'
import BackendLocalesEditor from './BackendLocalesEditor.tsx'
import FilterConfigEditor from './FilterConfigEditor.tsx'

const AdminPage = () => {
  const { t } = useTranslation()
  const { user, isLoading: isUserLoading, isUnauthorized } = useRequiredUser()
  const [tab, setTab] = useState(0)

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isUserLoading) {
    return <div>{t('v2:admin.loading')}</div>
  }

  if (!user) {
    return <div>{t('v2:admin.loading')}</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser={user.isSuperuser === true} />
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as number)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        TabIndicatorProps={{ style: { backgroundColor: 'black' } }}
        textColor="inherit"
      >
        <Tab label={t('v2:admin.settingsTabs.texts')} />
        <Tab label={t('v2:admin.settingsTabs.filters')} />
      </Tabs>

      {tab === 0 && <BackendLocalesEditor isSuperuser={user.isSuperuser === true} />}
      {tab === 1 && <FilterConfigEditor isSuperuser={user.isSuperuser === true} />}
    </Box>
  )
}

export default AdminPage
