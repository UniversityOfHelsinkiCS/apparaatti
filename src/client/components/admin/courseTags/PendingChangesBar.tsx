import { Alert, Stack, Typography } from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { createSnapshot, invalidateTagQueries, publishDraft } from './courseTagUtils.ts'
import PendingChangesActions from './PendingChangesActions.tsx'
import SnapshotDiffDialog from './SnapshotDiffDialog.tsx'
import SnapshotMetaFields from './SnapshotMetaFields.tsx'
import type { TagDraft } from './tagDraftBuffer.ts'
import { draftDiff, draftSize } from './tagDraftBuffer.ts'

interface PendingChangesBarProps {
  draft: TagDraft
  onSaved: () => void
  onDiscard: () => void
}

const PendingChangesBar = ({ draft, onSaved, onDiscard }: PendingChangesBarProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const metaRef = useRef({ name: '', description: '' })

  const changeCount = draftSize(draft)

  const handleMetaChange = useCallback((meta: { name: string; description: string }) => {
    metaRef.current = meta
  }, [])

  const openReview = () => {
    metaRef.current = { name: '', description: '' }
    setIsReviewOpen(true)
  }

  const closeReview = () => {
    setIsReviewOpen(false)
    metaRef.current = { name: '', description: '' }
  }

  const description = () => metaRef.current.description.trim() || null

  const versionName = () =>
    metaRef.current.name.trim() || `Saved ${new Date().toISOString().replace('T', ' ').slice(0, 16)}`

  const finish = async () => {
    closeReview()
    await invalidateTagQueries(queryClient)
    onSaved()
  }

  const publish = useMutation({
    mutationFn: () => publishDraft(description(), draft),
    onSuccess: finish,
  })

  const save = useMutation({
    mutationFn: () => createSnapshot(versionName(), description(), draft),
    onSuccess: finish,
  })

  const isBusy = publish.isPending || save.isPending

  const handleDiscard = () => {
    if (!window.confirm(t('v2:courseTags.publish.discardConfirm', { count: changeCount }))) return
    onDiscard()
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
        <Typography variant="body2">{t('v2:courseTags.publish.localExplanation')}</Typography>
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
        diff={isReviewOpen ? draftDiff(draft.mutations) : null}
        base={draft.base}
        onClose={closeReview}
        title={t('v2:courseTags.publish.reviewTitle')}
        content={
          <SnapshotMetaFields key={isReviewOpen ? 'open' : 'closed'} initialName="" onChange={handleMetaChange} />
        }
        actions={
          <PendingChangesActions isBusy={isBusy} onSave={() => save.mutate()} onPublish={() => publish.mutate()} />
        }
      />
    </Alert>
  )
}

export default PendingChangesBar
