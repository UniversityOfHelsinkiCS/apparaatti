import { Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type { TagSnapshotMeta } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { activateSnapshot, fetchPublishDiff, invalidateTagQueries } from './courseTagUtils.ts'
import SnapshotDiffDialog from './SnapshotDiffDialog.tsx'

interface PublishReviewDialogProps {
  snapshot: TagSnapshotMeta | null
  onClose: () => void
}

const PublishReviewDialog = ({ snapshot, onClose }: PublishReviewDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: diff } = useQuery({
    queryKey: ['course-tag-publish-diff', snapshot?.id],
    queryFn: () => fetchPublishDiff(snapshot?.id as number),
    enabled: snapshot !== null,
  })

  const publish = useMutation({
    mutationFn: () => activateSnapshot(snapshot?.id as number),
    onSuccess: async () => {
      onClose()
      await invalidateTagQueries(queryClient)
    },
  })

  return (
    <SnapshotDiffDialog
      diff={snapshot === null ? null : (diff ?? null)}
      base={{ kind: 'published' }}
      onClose={onClose}
      open={snapshot !== null}
      title={t('v2:courseTags.publish.reviewTitle')}
      content={
        <Typography variant="body2">
          {t('v2:courseTags.snapshots.activateConfirm', { name: snapshot?.name ?? '' })}
        </Typography>
      }
      actions={
        <BlackOutlinedButton type="button" onClick={() => publish.mutate()} disabled={publish.isPending}>
          {t('v2:courseTags.publish.confirmApply')}
        </BlackOutlinedButton>
      }
    />
  )
}

export default PublishReviewDialog
