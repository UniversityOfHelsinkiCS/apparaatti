import { Stack, TableCell, TableRow } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { TagSnapshotMeta } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

interface SnapshotRowProps {
  snapshot: TagSnapshotMeta
  isSuperuser: boolean
  isEdited: boolean
  onCompare: (snapshot: TagSnapshotMeta) => void
  onEdit: (snapshot: TagSnapshotMeta) => void
  onActivate: (snapshot: TagSnapshotMeta) => void
  onDelete: (snapshot: TagSnapshotMeta) => void
}

const SnapshotRow = ({
  snapshot,
  isSuperuser,
  isEdited,
  onCompare,
  onEdit,
  onActivate,
  onDelete,
}: SnapshotRowProps) => {
  const { t } = useTranslation()

  return (
    <TableRow selected={isEdited}>
      <TableCell>{snapshot.name}</TableCell>
      <TableCell>{snapshot.description ?? ''}</TableCell>
      <TableCell>{new Date(snapshot.createdAt).toLocaleString()}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <BlackOutlinedButton type="button" onClick={() => onCompare(snapshot)}>
            {t('v2:courseTags.snapshots.compare')}
          </BlackOutlinedButton>
          {isSuperuser ? (
            <>
              <BlackOutlinedButton type="button" onClick={() => onEdit(snapshot)}>
                {t('v2:courseTags.snapshots.edit')}
              </BlackOutlinedButton>
              <BlackOutlinedButton type="button" onClick={() => onActivate(snapshot)}>
                {t('v2:courseTags.snapshots.activate')}
              </BlackOutlinedButton>
              <BlackOutlinedButton type="button" onClick={() => onDelete(snapshot)}>
                {t('v2:courseTags.snapshots.delete')}
              </BlackOutlinedButton>
            </>
          ) : null}
        </Stack>
      </TableCell>
    </TableRow>
  )
}

export default SnapshotRow
