import { Chip, MenuItem, Stack, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { TagBase, TagSnapshotMeta } from '../../../../common/types.ts'
import { baseKey } from './tagDraftBuffer.ts'

interface EditedSnapshotSelectProps {
  snapshots: TagSnapshotMeta[]
  base: TagBase
  onChange: (base: TagBase) => void
}

const EditedSnapshotSelect = ({ snapshots, base, onChange }: EditedSnapshotSelectProps) => {
  const { t } = useTranslation()

  const handleChange = (value: string) =>
    onChange(value === 'published' ? { kind: 'published' } : { kind: 'snapshot', id: Number(value) })

  const active = snapshots.find(snapshot => snapshot.isActive) ?? null

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }} useFlexGap flexWrap="wrap">
      <TextField
        select
        size="small"
        label={t('v2:courseTags.editing.label')}
        value={baseKey(base) === 'published' ? 'published' : String((base as { id: number }).id)}
        onChange={event => handleChange(event.target.value)}
        sx={{ minWidth: 280 }}
      >
        <MenuItem value="published">{t('v2:courseTags.editing.published')}</MenuItem>
        {snapshots.map(snapshot => (
          <MenuItem key={snapshot.id} value={String(snapshot.id)}>
            {snapshot.isActive ? `${snapshot.name} — ${t('v2:courseTags.snapshots.activeShort')}` : snapshot.name}
          </MenuItem>
        ))}
      </TextField>

      <Chip
        size="small"
        label={
          active
            ? t('v2:courseTags.snapshots.activeIs', { name: active.name })
            : t('v2:courseTags.snapshots.activeUnknown')
        }
        sx={{ backgroundColor: '#111827', color: '#ffffff', fontWeight: 600 }}
      />
    </Stack>
  )
}

export default EditedSnapshotSelect
