import { Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TagBase } from '../../../../common/types.ts'
import { useAdminUser } from '../AdminMain.tsx'
import AdminNavbar from '../AdminNavbar.tsx'
import CourseTagsTabs from './CourseTagsTabs.tsx'
import { fetchSnapshots, fetchVocabulary } from './courseTagUtils.ts'
import CurTagMatrix from './CurTagMatrix.tsx'
import CuTagTab from './CuTagTab.tsx'
import EditingVersionBar from './EditingVersionBar.tsx'
import SnapshotsTab from './SnapshotsTab.tsx'
import { baseKey, readEditingVersionId, storeEditingVersionId } from './tagVersionState.ts'
import TagVocabularyTab from './TagVocabularyTab.tsx'

const CourseTagsPage = () => {
  const { t } = useTranslation()
  const user = useAdminUser()
  const [tab, setTab] = useState(0)
  const [editingVersionId, setEditingVersionId] = useState<number | null>(readEditingVersionId)

  const { data: snapshots, isSuccess: snapshotsLoaded } = useQuery({
    queryKey: ['course-tag-snapshots'],
    queryFn: fetchSnapshots,
  })

  const base: TagBase = editingVersionId === null ? { kind: 'published' } : { kind: 'snapshot', id: editingVersionId }
  const isEditable = editingVersionId !== null

  const handleVersionChange = (id: number | null) => {
    setEditingVersionId(id)
    storeEditingVersionId(id)
  }

  useEffect(() => {
    if (!snapshotsLoaded || editingVersionId === null) return
    if ((snapshots ?? []).some(snapshot => snapshot.id === editingVersionId)) return

    setEditingVersionId(null)
    storeEditingVersionId(null)
  }, [snapshotsLoaded, snapshots, editingVersionId])

  const { data: tags } = useQuery({
    queryKey: ['course-tags', baseKey(base)],
    queryFn: () => fetchVocabulary(base),
  })

  const courseTags = tags ?? []

  return (
    <Box>
      <AdminNavbar isSuperuser={user.isSuperuser === true} />

      <Typography variant="h5" sx={{ mb: 2 }}>
        {t('v2:courseTags.title')}
      </Typography>

      <EditingVersionBar
        snapshots={snapshots ?? []}
        base={base}
        editingVersionId={editingVersionId}
        isSuperuser={user.isSuperuser === true}
        onChange={handleVersionChange}
      />

      <CourseTagsTabs value={tab} onChange={setTab} />

      {tab === 0 ? <CurTagMatrix tags={courseTags} base={base} isEditable={isEditable} /> : null}
      {tab === 1 ? <CuTagTab tags={courseTags} base={base} isEditable={isEditable} /> : null}
      {tab === 2 ? (
        <TagVocabularyTab
          tags={courseTags}
          base={base}
          isEditable={isEditable}
          isSuperuser={user.isSuperuser === true}
        />
      ) : null}
      {tab === 3 ? (
        <SnapshotsTab
          isSuperuser={user.isSuperuser === true}
          base={base}
          onEditBase={snapshotBase => handleVersionChange(snapshotBase.kind === 'snapshot' ? snapshotBase.id : null)}
        />
      ) : null}
    </Box>
  )
}

export default CourseTagsPage
