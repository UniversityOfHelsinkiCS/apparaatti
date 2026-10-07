import { Box, Typography } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAdminUser } from '../AdminMain.tsx'
import AdminNavbar from '../AdminNavbar.tsx'
import CourseTagsTabs from './CourseTagsTabs.tsx'
import type { EditedSnapshot } from './courseTagUtils.ts'
import { fetchCourseTags, fetchSnapshots, invalidateTagQueries, restoreSnapshot } from './courseTagUtils.ts'
import CurTagMatrix from './CurTagMatrix.tsx'
import CuTagTab from './CuTagTab.tsx'
import EditedSnapshotSelect from './EditedSnapshotSelect.tsx'
import PendingChangesBar from './PendingChangesBar.tsx'
import SnapshotsTab from './SnapshotsTab.tsx'
import TagVocabularyTab from './TagVocabularyTab.tsx'

const CourseTagsPage = () => {
  const { t } = useTranslation()
  const user = useAdminUser()
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

  const courseTags = tags ?? []

  return (
    <Box>
      <AdminNavbar isSuperuser={user.isSuperuser === true} />

      <Typography variant="h5" sx={{ mb: 2 }}>
        {t('v2:courseTags.title')}
      </Typography>

      <EditedSnapshotSelect snapshots={snapshots ?? []} editedSnapshot={editedSnapshot} onChange={handleEditedChange} />

      <PendingChangesBar editedSnapshot={editedSnapshot} onEditingEnd={() => setEditedSnapshot(null)} />

      <CourseTagsTabs value={tab} onChange={setTab} />

      {tab === 0 ? <CurTagMatrix tags={courseTags} /> : null}
      {tab === 1 ? <CuTagTab tags={courseTags} /> : null}
      {tab === 2 ? <TagVocabularyTab tags={courseTags} isSuperuser={user.isSuperuser === true} /> : null}
      {tab === 3 ? (
        <SnapshotsTab
          isSuperuser={user.isSuperuser === true}
          editedSnapshot={editedSnapshot}
          onEditTagging={setEditedSnapshot}
        />
      ) : null}
    </Box>
  )
}

export default CourseTagsPage
