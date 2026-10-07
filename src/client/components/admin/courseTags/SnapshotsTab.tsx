import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TagBase, TagPayloadDiff, TagSnapshotMeta } from '../../../../common/types.ts'
import {
  activateSnapshot,
  deleteSnapshot,
  fetchSnapshotDiff,
  fetchSnapshots,
  invalidateTagQueries,
} from './courseTagUtils.ts'
import { matrixContainerSx } from './matrixStyles.ts'
import SnapshotDiffDialog from './SnapshotDiffDialog.tsx'
import SnapshotImportExport from './SnapshotImportExport.tsx'
import SnapshotRow from './SnapshotRow.tsx'

interface SnapshotsTabProps {
  isSuperuser: boolean
  base: TagBase
  onEditBase: (base: TagBase) => void
}

const SnapshotsTab = ({ isSuperuser, base, onEditBase }: SnapshotsTabProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [diff, setDiff] = useState<TagPayloadDiff | null>(null)

  const { data: snapshots } = useQuery({ queryKey: ['course-tag-snapshots'], queryFn: fetchSnapshots })

  const refresh = async () => {
    await invalidateTagQueries(queryClient)
  }

  const handleCompare = async (snapshot: TagSnapshotMeta) => {
    setDiff(await fetchSnapshotDiff(snapshot.id))
  }

  const handleEdit = async (snapshot: TagSnapshotMeta) => {
    onEditBase({ kind: 'snapshot', id: snapshot.id })
  }

  const handleActivate = async (snapshot: TagSnapshotMeta) => {
    if (!window.confirm(t('v2:courseTags.snapshots.activateConfirm', { name: snapshot.name }))) return
    await activateSnapshot(snapshot.id)
    await refresh()
  }

  const handleDelete = async (snapshot: TagSnapshotMeta) => {
    if (!window.confirm(t('v2:courseTags.snapshots.deleteConfirm'))) return
    await deleteSnapshot(snapshot.id)
    await refresh()
  }

  const snapshotRows = snapshots ?? []
  const editedId = base.kind === 'snapshot' ? base.id : null

  return (
    <Box>
      {isSuperuser ? <SnapshotImportExport base={base} onImported={refresh} /> : null}

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
                isEdited={editedId === snapshot.id}
                onCompare={handleCompare}
                onEdit={handleEdit}
                onActivate={handleActivate}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {snapshotRows.length === 0 ? <Typography sx={{ mt: 2 }}>{t('v2:courseTags.snapshots.empty')}</Typography> : null}

      <SnapshotDiffDialog diff={diff} base={base} onClose={() => setDiff(null)} />
    </Box>
  )
}

export default SnapshotsTab
