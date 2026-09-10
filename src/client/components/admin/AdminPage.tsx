import { Box, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { RedirectToLogin } from '../../util/redirectToLogin.ts'
import useRequiredUser from '../../util/useRequiredUser.ts'
import AdminNavbar from './AdminNavbar.tsx'
import BackendLocalesEditor from './BackendLocalesEditor.tsx'
import FilterConfigEditor from './FilterConfigEditor.tsx'
import RecommendationCodesEditor from './RecommendationCodesEditor.tsx'
import RecommendationLanguagesEditor from './RecommendationLanguagesEditor.tsx'

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

  const isSuperuser = user.isSuperuser === true

  return (
    <Box sx={{ p: 3 }}>
      <AdminNavbar isSuperuser={isSuperuser} />
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as number)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        TabIndicatorProps={{ style: { backgroundColor: 'black' } }}
        textColor="inherit"
      >
        <Tab label={t('v2:admin.settingsTabs.texts')} />
        <Tab label={t('v2:admin.settingsTabs.filters')} />
        <Tab label={t('v2:admin.settingsTabs.codes')} />
        {isSuperuser && <Tab label={t('v2:admin.settingsTabs.languages')} />}
      </Tabs>

      {tab === 0 && <BackendLocalesEditor isSuperuser={isSuperuser} />}
      {tab === 1 && <FilterConfigEditor isSuperuser={isSuperuser} />}
      {tab === 2 && <RecommendationCodesEditor isSuperuser={isSuperuser} />}
      {tab === 3 && isSuperuser && <RecommendationLanguagesEditor />}
    </Box>
  )
}

export default AdminPage
