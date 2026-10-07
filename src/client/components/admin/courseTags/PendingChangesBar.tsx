import { Alert, Stack, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import type { EditedSnapshot } from './courseTagUtils.ts'
import {
  createSnapshot,
  discardDraft,
  fetchPendingChanges,
  invalidateTagQueries,
  overwriteSnapshot,
  publishDraft,
  updateSnapshot,
} from './courseTagUtils.ts'
import PendingChangesActions from './PendingChangesActions.tsx'
import SnapshotDiffDialog from './SnapshotDiffDialog.tsx'
import SnapshotMetaFields from './SnapshotMetaFields.tsx'

interface PendingChangesBarProps {
  editedSnapshot: EditedSnapshot | null
  onEditingEnd: () => void
}

const PendingChangesBar = ({ editedSnapshot, onEditingEnd }: PendingChangesBarProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const metaRef = useRef({ name: '', description: '' })

  const { data: pending } = useQuery({ queryKey: ['course-tag-pending'], queryFn: fetchPendingChanges })

  const refresh = () => invalidateTagQueries(queryClient)

  const handleMetaChange = useCallback((meta: { name: string; description: string }) => {
    metaRef.current = meta
  }, [])

  const openReview = () => {
    metaRef.current = { name: editedSnapshot?.name ?? '', description: '' }
    setIsReviewOpen(true)
  }

  const closeReview = () => {
    setIsReviewOpen(false)
    metaRef.current = { name: '', description: '' }
  }

  const description = () => metaRef.current.description.trim() || null

  const versionName = () =>
    metaRef.current.name.trim() || `Saved ${new Date().toISOString().replace('T', ' ').slice(0, 16)}`

  const publish = useMutation({
    mutationFn: () => publishDraft(description()),
    onSuccess: () => {
      closeReview()
      onEditingEnd()
      return refresh()
    },
  })

  const saveToVersion = useMutation({
    mutationFn: async () => {
      if (!editedSnapshot) return
      await overwriteSnapshot(editedSnapshot.id)
      await updateSnapshot(editedSnapshot.id, versionName(), description())
    },
    onSuccess: () => {
      closeReview()
      onEditingEnd()
      return refresh()
    },
  })

  const save = useMutation({
    mutationFn: () => createSnapshot(versionName(), description()),
    onSuccess: () => {
      closeReview()
      return refresh()
    },
  })

  const discard = useMutation({
    mutationFn: discardDraft,
    onSuccess: () => {
      onEditingEnd()
      return refresh()
    },
  })

  const changeCount = pending
    ? pending.addedCurTags.length +
      pending.removedCurTags.length +
      pending.addedCuTags.length +
      pending.removedCuTags.length
    : 0

  const isBusy = publish.isPending || save.isPending || saveToVersion.isPending || discard.isPending

  const handleDiscard = () => {
    if (!window.confirm(t('v2:courseTags.publish.discardConfirm', { count: changeCount }))) return
    discard.mutate()
  }

  if (changeCount === 0) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        {t('v2:courseTags.publish.upToDate')}
      </Alert>
    )
  }

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} useFlexGap>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {t('v2:courseTags.publish.pending', { count: changeCount })}
        </Typography>
        <Typography variant="body2">
          {editedSnapshot
            ? t('v2:courseTags.publish.editingVersion', { name: editedSnapshot.name })
            : t('v2:courseTags.publish.explanation')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <BlackOutlinedButton type="button" onClick={openReview} disabled={isBusy}>
            {t('v2:courseTags.publish.apply')}
          </BlackOutlinedButton>
          <BlackOutlinedButton type="button" onClick={handleDiscard} disabled={isBusy}>
            {t('v2:courseTags.publish.discard')}
          </BlackOutlinedButton>
        </Stack>
      </Stack>

      <SnapshotDiffDialog
        diff={isReviewOpen ? (pending ?? null) : null}
        onClose={closeReview}
        title={t('v2:courseTags.publish.reviewTitle')}
        content={
          <SnapshotMetaFields
            key={isReviewOpen ? 'open' : 'closed'}
            initialName={editedSnapshot?.name ?? ''}
            onChange={handleMetaChange}
          />
        }
        actions={
          <PendingChangesActions
            editedSnapshot={editedSnapshot}
            isBusy={isBusy}
            onSaveToVersion={() => saveToVersion.mutate()}
            onSave={() => save.mutate()}
            onPublish={() => publish.mutate()}
          />
        }
      />
    </Alert>
  )
}

export default PendingChangesBar
