import { Alert, Stack, Typography } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { discardDraft, fetchPendingChanges, invalidateTagQueries, publishDraft } from './courseTagUtils.ts'

const PendingChangesBar = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: pending } = useQuery({ queryKey: ['course-tag-pending'], queryFn: fetchPendingChanges })

  const refresh = () => invalidateTagQueries(queryClient)

  const publish = useMutation({ mutationFn: publishDraft, onSuccess: refresh })
  const discard = useMutation({ mutationFn: discardDraft, onSuccess: refresh })

  const changeCount = pending
    ? pending.addedCurTags.length +
      pending.removedCurTags.length +
      pending.addedCuTags.length +
      pending.removedCuTags.length
    : 0

  const isBusy = publish.isPending || discard.isPending

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
        <Typography variant="body2">{t('v2:courseTags.publish.explanation')}</Typography>
        <Stack direction="row" spacing={1}>
          <BlackOutlinedButton type="button" onClick={() => publish.mutate()} disabled={isBusy}>
            {t('v2:courseTags.publish.apply')}
          </BlackOutlinedButton>
          <BlackOutlinedButton type="button" onClick={handleDiscard} disabled={isBusy}>
            {t('v2:courseTags.publish.discard')}
          </BlackOutlinedButton>
        </Stack>
      </Stack>
    </Alert>
  )
}

export default PendingChangesBar
