import { Alert, Stack, TextField, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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
import SnapshotDiffDialog from './SnapshotDiffDialog.tsx'

interface PendingChangesBarProps {
  editedSnapshot: EditedSnapshot | null
  onEditingEnd: () => void
}

const PendingChangesBar = ({ editedSnapshot, onEditingEnd }: PendingChangesBarProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data: pending } = useQuery({ queryKey: ['course-tag-pending'], queryFn: fetchPendingChanges })

  const refresh = () => invalidateTagQueries(queryClient)

  const openReview = () => {
    setName(editedSnapshot?.name ?? '')
    setDescription('')
    setIsReviewOpen(true)
  }

  const closeReview = () => {
    setIsReviewOpen(false)
    setName('')
    setDescription('')
  }

  const versionName = () => name.trim() || `Saved ${new Date().toISOString().replace('T', ' ').slice(0, 16)}`

  const publish = useMutation({
    mutationFn: () => publishDraft(description.trim() || null),
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
      await updateSnapshot(editedSnapshot.id, versionName(), description.trim() || null)
    },
    onSuccess: () => {
      closeReview()
      onEditingEnd()
      return refresh()
    },
  })

  const save = useMutation({
    mutationFn: () => createSnapshot(versionName(), description.trim() || null),
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
          <Stack spacing={2}>
            <TextField
              size="small"
              fullWidth
              label={t('v2:courseTags.publish.nameLabel')}
              helperText={t('v2:courseTags.publish.nameHelp')}
              value={name}
              onChange={event => setName(event.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label={t('v2:courseTags.publish.descriptionLabel')}
              helperText={t('v2:courseTags.publish.descriptionHelp')}
              value={description}
              onChange={event => setDescription(event.target.value)}
            />
          </Stack>
        }
        actions={
          <>
            {editedSnapshot ? (
              <BlackOutlinedButton type="button" onClick={() => saveToVersion.mutate()} disabled={isBusy}>
                {t('v2:courseTags.publish.saveToVersion', { name: editedSnapshot.name })}
              </BlackOutlinedButton>
            ) : null}
            <BlackOutlinedButton type="button" onClick={() => save.mutate()} disabled={isBusy}>
              {editedSnapshot ? t('v2:courseTags.publish.saveAsNew') : t('v2:courseTags.publish.saveOnly')}
            </BlackOutlinedButton>
            <BlackOutlinedButton type="button" onClick={() => publish.mutate()} disabled={isBusy}>
              {t('v2:courseTags.publish.confirmApply')}
            </BlackOutlinedButton>
          </>
        }
      />
    </Alert>
  )
}

export default PendingChangesBar
