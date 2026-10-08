import { Alert, MenuItem, Stack, TextField } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TagBase, TagSnapshotMeta } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { createSnapshot, emptyMutations, invalidateTagQueries } from './courseTagUtils.ts'
import NewVersionDialog from './NewVersionDialog.tsx'
import PublishReviewDialog from './PublishReviewDialog.tsx'

interface EditingVersionBarProps {
  snapshots: TagSnapshotMeta[]
  base: TagBase
  editingVersionId: number | null
  isSuperuser: boolean
  onChange: (id: number | null) => void
}

const EditingVersionBar = ({ snapshots, base, editingVersionId, isSuperuser, onChange }: EditingVersionBarProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [reviewed, setReviewed] = useState<TagSnapshotMeta | null>(null)

  const activeVersionName = snapshots.find(snapshot => snapshot.isActive)?.name ?? null
  const editedVersion = snapshots.find(snapshot => snapshot.id === editingVersionId) ?? null

  const create = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string | null }) => {
      const response = await createSnapshot(name, description, { base, mutations: emptyMutations })
      return (await response.json()) as TagSnapshotMeta
    },
    onSuccess: async created => {
      setIsNewOpen(false)
      await invalidateTagQueries(queryClient)
      onChange(created.id)
    },
  })

  const liveLine = activeVersionName
    ? t('v2:courseTags.publish.liveVersion', { name: activeVersionName })
    : t('v2:courseTags.publish.liveUnknown')

  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" useFlexGap flexWrap="wrap">
        <TextField
          select
          size="small"
          label={t('v2:courseTags.editing.label')}
          value={editingVersionId === null ? 'published' : String(editingVersionId)}
          onChange={event => onChange(event.target.value === 'published' ? null : Number(event.target.value))}
          sx={{ minWidth: 280 }}
        >
          <MenuItem value="published">{t('v2:courseTags.editing.published')}</MenuItem>
          {snapshots.map(snapshot => (
            <MenuItem key={snapshot.id} value={String(snapshot.id)}>
              {snapshot.isActive ? `${snapshot.name} — ${t('v2:courseTags.snapshots.activeShort')}` : snapshot.name}
            </MenuItem>
          ))}
        </TextField>

        <BlackOutlinedButton type="button" onClick={() => setIsNewOpen(true)} disabled={create.isPending}>
          {t('v2:courseTags.editing.new')}
        </BlackOutlinedButton>

        {editedVersion && isSuperuser ? (
          <BlackOutlinedButton type="button" onClick={() => setReviewed(editedVersion)}>
            {t('v2:courseTags.publish.publishVersion')}
          </BlackOutlinedButton>
        ) : null}
      </Stack>

      <Alert severity={editedVersion ? 'info' : 'warning'}>
        {editedVersion
          ? `${t('v2:courseTags.editing.editingVersion', { name: editedVersion.name })} ${liveLine}`
          : `${t('v2:courseTags.editing.readOnly')} ${liveLine}`}
      </Alert>

      <NewVersionDialog
        open={isNewOpen}
        isBusy={create.isPending}
        onClose={() => setIsNewOpen(false)}
        onCreate={(name, description) => create.mutate({ name, description })}
      />

      <PublishReviewDialog snapshot={reviewed} onClose={() => setReviewed(null)} />
    </Stack>
  )
}

export default EditingVersionBar
