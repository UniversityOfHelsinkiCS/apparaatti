import { MenuItem, Stack, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { TagSnapshotMeta } from '../../../../common/types.ts'
import type { EditedSnapshot } from './courseTagUtils.ts'

interface EditedSnapshotSelectProps {
  snapshots: TagSnapshotMeta[]
  editedSnapshot: EditedSnapshot | null
  onChange: (value: string) => void
}

const EditedSnapshotSelect = ({ snapshots, editedSnapshot, onChange }: EditedSnapshotSelectProps) => {
  const { t } = useTranslation()

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <TextField
        select
        size="small"
        label={t('v2:courseTags.editing.label')}
        value={editedSnapshot ? String(editedSnapshot.id) : 'new'}
        onChange={event => onChange(event.target.value)}
        sx={{ minWidth: 280 }}
      >
        <MenuItem value="new">{t('v2:courseTags.editing.new')}</MenuItem>
        {snapshots.map(snapshot => (
          <MenuItem key={snapshot.id} value={String(snapshot.id)}>
            {snapshot.name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  )
}

export default EditedSnapshotSelect
