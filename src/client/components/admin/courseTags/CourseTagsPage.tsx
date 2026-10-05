import { Box, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { RedirectToLogin } from '../../../util/redirectToLogin.ts'
import useRequiredUser from '../../../util/useRequiredUser.ts'
import AdminNavbar from '../AdminNavbar.tsx'
import type { EditedSnapshot } from './courseTagUtils.ts'
import { fetchCourseTags, fetchSnapshots, invalidateTagQueries, restoreSnapshot } from './courseTagUtils.ts'
import CurTagMatrix from './CurTagMatrix.tsx'
import CuTagTab from './CuTagTab.tsx'
import PendingChangesBar from './PendingChangesBar.tsx'
import SnapshotsTab from './SnapshotsTab.tsx'
import TagVocabularyTab from './TagVocabularyTab.tsx'

const CourseTagsPage = () => {
  const { t } = useTranslation()
  const { user, isLoading, isUnauthorized } = useRequiredUser()
  const [tab, setTab] = useState(0)
  const [editedSnapshot, setEditedSnapshot] = useState<EditedSnapshot | null>(null)

  const queryClient = useQueryClient()

  const { data: tags } = useQuery({ queryKey: ['course-tags'], queryFn: fetchCourseTags })
  const { data: snapshots } = useQuery({ queryKey: ['course-tag-snapshots'], queryFn: fetchSnapshots })

  const handleEditedChange = async (value: string) => {
    if (value === 'new') {
      setEditedSnapshot(null)
      return
    }

    const snapshot = (snapshots ?? []).find(row => String(row.id) === value)
    if (!snapshot) return
    if (!window.confirm(t('v2:courseTags.snapshots.editTaggingConfirm', { name: snapshot.name }))) return

    await restoreSnapshot(snapshot.id)
    setEditedSnapshot({ id: snapshot.id, name: snapshot.name })
    await invalidateTagQueries(queryClient)
  }

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

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label={t('v2:courseTags.editing.label')}
          value={editedSnapshot ? String(editedSnapshot.id) : 'new'}
          onChange={event => handleEditedChange(event.target.value)}
          sx={{ minWidth: 280 }}
        >
          <MenuItem value="new">{t('v2:courseTags.editing.new')}</MenuItem>
          {(snapshots ?? []).map(snapshot => (
            <MenuItem key={snapshot.id} value={String(snapshot.id)}>
              {snapshot.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <PendingChangesBar editedSnapshot={editedSnapshot} onEditingEnd={() => setEditedSnapshot(null)} />

      <Tabs
        value={tab}
        onChange={(_event, value) => setTab(value)}
        sx={{
          mb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '& .MuiTab-root': { color: '#374151', fontWeight: 600 },
          '& .MuiTab-root.Mui-selected': { color: '#111827' },
          '& .MuiTab-root:focus-visible': { outline: '2px solid #2563eb', outlineOffset: -2 },
          '& .MuiTabs-indicator': { backgroundColor: '#111827', height: 3 },
        }}
      >
        <Tab label={t('v2:courseTags.tabs.realisations')} />
        <Tab label={t('v2:courseTags.tabs.courseUnits')} />
        <Tab label={t('v2:courseTags.tabs.vocabulary')} />
        <Tab label={t('v2:courseTags.tabs.snapshots')} />
      </Tabs>

      {tab === 0 ? <CurTagMatrix tags={courseTags} /> : null}
      {tab === 1 ? <CuTagTab tags={courseTags} /> : null}
      {tab === 2 ? <TagVocabularyTab tags={courseTags} isSuperuser={user.isSuperuser ?? false} /> : null}
      {tab === 3 ? (
        <SnapshotsTab
          isSuperuser={user.isSuperuser ?? false}
          editedSnapshot={editedSnapshot}
          onEditTagging={setEditedSnapshot}
        />
      ) : null}
    </Box>
  )
}

export default CourseTagsPage
