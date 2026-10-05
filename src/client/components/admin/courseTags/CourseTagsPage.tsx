import { Box, Tab, Tabs, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { RedirectToLogin } from '../../../util/redirectToLogin.ts'
import useRequiredUser from '../../../util/useRequiredUser.ts'
import AdminNavbar from '../AdminNavbar.tsx'
import { fetchCourseTags } from './courseTagUtils.ts'
import CurTagMatrix from './CurTagMatrix.tsx'
import CuTagTab from './CuTagTab.tsx'
import SnapshotsTab from './SnapshotsTab.tsx'
import TagVocabularyTab from './TagVocabularyTab.tsx'

const CourseTagsPage = () => {
  const { t } = useTranslation()
  const { user, isLoading, isUnauthorized } = useRequiredUser()
  const [tab, setTab] = useState(0)

  const { data: tags } = useQuery({ queryKey: ['course-tags'], queryFn: fetchCourseTags })

  if (isUnauthorized) {
    return <RedirectToLogin />
  }

  if (isLoading || !user) {
    return <div>{t('v2:admin.loading')}</div>
  }

  if (!user.isAdmin) {
    return <Navigate to={'/'} replace />
  }

  const courseTags = tags ?? []

  return (
    <Box>
      <AdminNavbar isSuperuser={user.isSuperuser ?? false} />

      <Typography variant="h5" sx={{ mb: 2 }}>
        {t('v2:courseTags.title')}
      </Typography>

      <Tabs value={tab} onChange={(_event, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label={t('v2:courseTags.tabs.realisations')} />
        <Tab label={t('v2:courseTags.tabs.courseUnits')} />
        <Tab label={t('v2:courseTags.tabs.vocabulary')} />
        <Tab label={t('v2:courseTags.tabs.snapshots')} />
      </Tabs>

      {tab === 0 ? <CurTagMatrix tags={courseTags} /> : null}
      {tab === 1 ? <CuTagTab tags={courseTags} /> : null}
      {tab === 2 ? <TagVocabularyTab tags={courseTags} isSuperuser={user.isSuperuser ?? false} /> : null}
      {tab === 3 ? <SnapshotsTab isSuperuser={user.isSuperuser ?? false} /> : null}
    </Box>
  )
}

export default CourseTagsPage
