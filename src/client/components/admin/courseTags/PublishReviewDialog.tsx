import { Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type { TagBase, TagSnapshotMeta } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { activateSnapshot, fetchSnapshotDiff, invalidateTagQueries } from './courseTagUtils.ts'
import SnapshotDiffDialog from './SnapshotDiffDialog.tsx'

interface PublishReviewDialogProps {
  snapshot: TagSnapshotMeta | null
  onClose: () => void
}

// A version is only ever published from here, so the diff against the applied
// tagging is always on screen before the apply button can be pressed.
const PublishReviewDialog = ({ snapshot, onClose }: PublishReviewDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: diff } = useQuery({
    queryKey: ['course-tag-snapshot-diff', snapshot?.id],
    queryFn: () => fetchSnapshotDiff(snapshot?.id as number),
    enabled: snapshot !== null,
  })

  const publish = useMutation({
    mutationFn: () => activateSnapshot(snapshot?.id as number),
    onSuccess: async () => {
      onClose()
      await invalidateTagQueries(queryClient)
    },
  })

  const base: TagBase = snapshot === null ? { kind: 'published' } : { kind: 'snapshot', id: snapshot.id }

  return (
    <SnapshotDiffDialog
      diff={snapshot === null ? null : (diff ?? null)}
      base={base}
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
