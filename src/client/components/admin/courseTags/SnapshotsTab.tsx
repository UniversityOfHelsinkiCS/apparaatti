import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TagPayloadDiff, TagSnapshotMeta } from '../../../../common/types.ts'
import type { EditedSnapshot } from './courseTagUtils.ts'
import {
  activateSnapshot,
  createSnapshot,
  deleteSnapshot,
  fetchSnapshotDiff,
  fetchSnapshots,
  invalidateTagQueries,
  restoreSnapshot,
} from './courseTagUtils.ts'
import { matrixContainerSx } from './matrixStyles.ts'
import SnapshotCreateForm from './SnapshotCreateForm.tsx'
import SnapshotDiffDialog from './SnapshotDiffDialog.tsx'
import SnapshotImportExport from './SnapshotImportExport.tsx'
import SnapshotRow from './SnapshotRow.tsx'

interface SnapshotsTabProps {
  isSuperuser: boolean
  editedSnapshot: EditedSnapshot | null
  onEditTagging: (snapshot: EditedSnapshot) => void
}

const SnapshotsTab = ({ isSuperuser, editedSnapshot, onEditTagging }: SnapshotsTabProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [diff, setDiff] = useState<TagPayloadDiff | null>(null)

  const { data: snapshots } = useQuery({ queryKey: ['course-tag-snapshots'], queryFn: fetchSnapshots })

  const refresh = async () => {
    await invalidateTagQueries(queryClient)
  }

  const handleSave = async (name: string, description: string | null) => {
    await createSnapshot(name, description)
    await refresh()
  }

  const handleCompare = async (snapshot: TagSnapshotMeta) => {
    setDiff(await fetchSnapshotDiff(snapshot.id))
  }

  const handleEdit = async (snapshot: TagSnapshotMeta) => {
    if (!window.confirm(t('v2:courseTags.snapshots.editTaggingConfirm', { name: snapshot.name }))) return
    await restoreSnapshot(snapshot.id)
    onEditTagging({ id: snapshot.id, name: snapshot.name })
    await refresh()
  }

  const handleActivate = async (snapshot: TagSnapshotMeta) => {
    if (!window.confirm(t('v2:courseTags.snapshots.activateConfirm', { name: snapshot.name }))) return
    await activateSnapshot(snapshot.id)
    await refresh()
  }

  const handleRestore = async (snapshot: TagSnapshotMeta) => {
    if (!window.confirm(t('v2:courseTags.snapshots.restoreConfirm', { name: snapshot.name }))) return
    await restoreSnapshot(snapshot.id)
    await refresh()
  }

  const handleDelete = async (snapshot: TagSnapshotMeta) => {
    if (!window.confirm(t('v2:courseTags.snapshots.deleteConfirm'))) return
    await deleteSnapshot(snapshot.id)
    await refresh()
  }

  const snapshotRows = snapshots ?? []

  return (
    <Box>
      <SnapshotCreateForm onSave={handleSave} />

      {isSuperuser ? <SnapshotImportExport onImported={refresh} /> : null}

      <TableContainer sx={matrixContainerSx}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t('v2:courseTags.snapshots.name')}</TableCell>
              <TableCell>{t('v2:courseTags.snapshots.description')}</TableCell>
              <TableCell>{t('v2:courseTags.snapshots.createdAt')}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {snapshotRows.map(snapshot => (
              <SnapshotRow
                key={snapshot.id}
                snapshot={snapshot}
                isSuperuser={isSuperuser}
                isEdited={editedSnapshot?.id === snapshot.id}
                onCompare={handleCompare}
                onEdit={handleEdit}
                onActivate={handleActivate}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {snapshotRows.length === 0 ? <Typography sx={{ mt: 2 }}>{t('v2:courseTags.snapshots.empty')}</Typography> : null}

      <SnapshotDiffDialog diff={diff} onClose={() => setDiff(null)} />
    </Box>
  )
}

export default SnapshotsTab
