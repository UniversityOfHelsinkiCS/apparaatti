import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type { FilterSnapshotMeta } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import FilterDiffList from './FilterDiffList.tsx'
import { activateFilterSnapshot, fetchFilterPublishDiff, invalidateFilterVersionQueries } from './filterSnapshotApi.ts'

interface FilterPublishReviewDialogProps {
  snapshot: FilterSnapshotMeta | null
  onClose: () => void
}

const FilterPublishReviewDialog = ({ snapshot, onClose }: FilterPublishReviewDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: diff } = useQuery({
    queryKey: ['filter-publish-diff', snapshot?.id],
    queryFn: () => fetchFilterPublishDiff(snapshot?.id as number),
    enabled: snapshot !== null,
  })

  const publish = useMutation({
    mutationFn: () => activateFilterSnapshot(snapshot?.id as number),
    onSuccess: async () => {
      onClose()
      await invalidateFilterVersionQueries(queryClient)
    },
  })

  const dialog = (
    <Dialog open={snapshot !== null} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t('v2:filterVersions.publish.reviewTitle')}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('v2:filterVersions.publish.confirm', { name: snapshot?.name ?? '' })}
        </Typography>
        <FilterDiffList diff={snapshot === null ? null : (diff ?? null)} />
      </DialogContent>
      <DialogActions>
        <BlackOutlinedButton type="button" onClick={onClose} disabled={publish.isPending}>
          {t('v2:filterVersions.cancel')}
        </BlackOutlinedButton>
        <BlackOutlinedButton type="button" onClick={() => publish.mutate()} disabled={publish.isPending}>
          {t('v2:filterVersions.publish.confirmApply')}
        </BlackOutlinedButton>
      </DialogActions>
    </Dialog>
  )

  return dialog
}

export default FilterPublishReviewDialog
